// app/api/auth/login/route.js
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    // ✅ Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // ✅ Check if user is active (if you have this field)
    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // ✅ Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // ✅ Generate proper JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not configured');
      console.error('Please add JWT_SECRET to your .env.local file');
      return NextResponse.json(
        { success: false, error: 'Server configuration error - JWT secret missing' },
        { status: 500 }
      );
    }

    if (jwtSecret.length < 32) {
      console.error('JWT_SECRET is too short - should be at least 32 characters');
      return NextResponse.json(
        { success: false, error: 'Server configuration error - weak JWT secret' },
        { status: 500 }
      );
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'USER',
    };

    const token = jwt.sign(
      tokenPayload,
      jwtSecret,
      { 
        expiresIn: '24h', // Token expires in 24 hours
        issuer: 'helpdesk-app'
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name || email.split('@')[0],
        email: user.email,
        role: user.role || 'USER',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}