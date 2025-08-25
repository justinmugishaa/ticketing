// app/api/tickets/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * Helper: Verify JWT token
 */
async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * GET /api/tickets/[id] - Get ticket with comments
 */
export async function GET(request, { params }) {
  try {
    // ✅ Await params in Next.js 15
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    // ✅ Verify user is authenticated
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Fetch ticket with user and comments
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tickets/[id] - Update ticket OR add comment
 */
export async function PUT(request, { params }) {
  try {
    // ✅ Await params in Next.js 15
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // ✅ Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Check if this is a comment
    if (body.comment) {
      const comment = await prisma.comment.create({
        data: {
          content: body.comment,
          role: user.role,
          userId: user.userId,
          ticketId: id,
        },
        include: { user: { select: { name: true, role: true } } },
      });

      return NextResponse.json({ success: true, comment });
    }

    // ✅ Otherwise, update ticket (only owner or admin)
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to edit this ticket' },
        { status: 403 }
      );
    }

    // ✅ Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        title: body.title?.trim(),
        description: body.description?.trim(),
        priority: body.priority?.toUpperCase(),
        status: body.status?.toUpperCase(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        comments: { include: { user: { select: { name: true, role: true } } } },
      },
    });

    return NextResponse.json({ success: true, data: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket or adding comment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tickets/[id] - Delete ticket
 * ✅ Only owner or admin can delete
 * ✅ Only if status is OPEN
 */
export async function DELETE(request, { params }) {
  try {
    // ✅ Await params in Next.js 15
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    // ✅ Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Check if ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // ✅ Ownership check
    if (ticket.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to delete this ticket' },
        { status: 403 }
      );
    }

    // ✅ Only allow deletion if ticket is OPEN
    if (ticket.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Only open tickets can be deleted' },
        { status: 400 }
      );
    }

    // ✅ Delete ticket (and comments via CASCADE)
    await prisma.ticket.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}