// app/lib/auth.js
import jwt from 'jsonwebtoken';

/**
 * Verifies the JWT token from request
 * @param {Request} request - Next.js API request
 * @returns {Object|null} - Decoded user object or null if invalid
 */
export async function verifyAuth(request) {
  try {
    // ✅ Check Authorization header (case-insensitive)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Fallback: Check cookies
    const cookieString = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieString
        .split(';')
        .map(cookie => {
          const parts = cookie.trim().split('=');
          return parts.length === 2 ? [parts[0], decodeURIComponent(parts[1])] : null;
        })
        .filter(Boolean)
    );

    const tokenFromCookie = token || cookies.auth_token || cookies.token;

    if (!tokenFromCookie) {
      console.log('No token found in header or cookies');
      return null;
    }

    // ✅ Use environment variable for secret
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not set in environment');
      return null;
    }

    const decoded = jwt.verify(tokenFromCookie, secret);

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'USER',
    };
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return null;
  }
}