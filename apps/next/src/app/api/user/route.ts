import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // In a real app, you'd get the user ID from the session/JWT token
    // For demo purposes, we'll return the first user or create a mock user
    const users = await User.find().limit(1);
    
    if (users.length > 0) {
      const user = users[0];
      return NextResponse.json({
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        githubToken: user.githubToken ? 'connected' : null,
        bitbucketToken: user.bitbucketToken ? 'connected' : null,
        githubUsername: user.githubUsername,
        bitbucketUsername: user.bitbucketUsername,
      });
    }
    
    // Return mock user for demo
    return NextResponse.json({
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      image: null,
      githubToken: null,
      bitbucketToken: null,
      githubUsername: null,
      bitbucketUsername: null,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

