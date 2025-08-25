// app/api/tickets/user/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// ✅ JWT verification helper
function verifyToken(token) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// ✅ Extract token from request headers
function getTokenFromRequest(request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, role } = body;

    // ✅ Get and verify authentication token
    let token = getTokenFromRequest(request);
    
    // Fallback to body token (for backward compatibility)
    if (!token && body.token) {
      token = body.token;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // ✅ Verify the JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // ✅ Validate that the decoded token matches the request
    if (decoded.email !== email) {
      return NextResponse.json(
        { success: false, error: 'Token email does not match request email' },
        { status: 403 }
      );
    }

    // ✅ Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // ✅ Use role from database, not request body
    const userRole = user.role;

    // ✅ Build query based on role
    let whereClause;
    if (userRole === 'ADMIN') {
      // Admins can see all tickets
      whereClause = {};
    } else {
      // Regular users see only their own tickets
      whereClause = { userId: user.id };
    }

    // ✅ Fetch tickets WITH COMMENTS
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                role: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      tickets,
      userInfo: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Error fetching user tickets:', error);
    
    // ✅ Handle specific JWT error types
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, error: 'Authentication token has expired' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}