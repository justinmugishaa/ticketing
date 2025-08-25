// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Add any server-side logout logic here
    // Like invalidating tokens, clearing sessions, etc.
    
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear any HTTP-only cookies if you're using them
    response.cookies.delete('token');
    response.cookies.delete('session');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}