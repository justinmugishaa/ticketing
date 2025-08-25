// lib/auth-middleware.js
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function verifyAuth(request) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: 'Authorization header missing or invalid',
        status: 401
      };
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return {
        error: 'User not found',
        status: 404
      };
    }

    if (!user.isActive) {
      return {
        error: 'Account inactive',
        status: 403
      };
    }

    return {
      user,
      success: true
    };

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return {
        error: 'Invalid token',
        status: 401
      };
    }
    
    if (error.name === 'TokenExpiredError') {
      return {
        error: 'Token expired',
        status: 401
      };
    }

    console.error('Auth verification error:', error);
    return {
      error: 'Authentication failed',
      status: 500
    };
  }
}

// Usage in API routes:
// const authResult = await verifyAuth(request);
// if (!authResult.success) {
//   return NextResponse.json(
//     { success: false, error: authResult.error },
//     { status: authResult.status }
//   );
// }
// const user = authResult.user;