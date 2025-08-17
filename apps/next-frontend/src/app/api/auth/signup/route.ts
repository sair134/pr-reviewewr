import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateEmail } from '@automate/shared/utils';

// In a real app, this would be in a database
const MOCK_USERS: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
}> = [];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists (in real app, query database)
    const existingUser = MOCK_USERS.find(u => u.email === email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (in real app, save to database)
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name
    };

    MOCK_USERS.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { 
        success: true, 
        user: { id: newUser.id, email: newUser.email, name: newUser.name } 
      },
      { status: 201 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
