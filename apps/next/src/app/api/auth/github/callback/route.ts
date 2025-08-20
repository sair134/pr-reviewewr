import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { encryptToken } from '@/lib/encryption';

async function exchangeGitHubCode(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = await response.json();
  console.log('GitHub token exchange response:', { success: !!data.access_token, error: data.error });
  return data.access_token;
}

async function getGitHubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  const data = await response.json();
  console.log('GitHub user data:', { id: data.id, login: data.login, email: data.email });
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    console.log('GitHub callback received:', { code: !!code, state });
    
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Exchange code for access token
    const accessToken = await exchangeGitHubCode(
      code,
      process.env.GITHUB_AUTH_CLIENT || '',
      process.env.GITHUB_AUTH_SECRET || '',
      process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/github/callback'
    );

    if (!accessToken) {
      console.error('Failed to get GitHub access token');
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 });
    }

    console.log('GitHub access token received successfully');

    // Get user info
    const userData = await getGitHubUser(accessToken);

    if (!userData.id) {
      console.error('Failed to get GitHub user data');
      return NextResponse.json({ error: 'Failed to get GitHub user data' }, { status: 400 });
    }

    // Connect to database
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');

    // Find or create user by GitHub ID (primary) or email (fallback)
    let user = await User.findOne({ 
      $or: [
        { githubId: userData.id.toString() },
        ...(userData.email ? [{ email: userData.email }] : [])
      ]
    });
    
    console.log('User lookup result:', { found: !!user, githubId: userData.id.toString() });
    
    if (!user) {
      // Create new user
      console.log('Creating new user...');
      user = new User({
        email: userData.email || undefined, // Only set if email exists
        name: userData.name || userData.login,
        image: userData.avatar_url,
        githubToken: encryptToken(accessToken),
        githubUsername: userData.login,
        githubId: userData.id.toString(),
      });
    } else {
      // Update existing user
      console.log('Updating existing user...');
      user.githubToken = encryptToken(accessToken);
      user.githubUsername = userData.login;
      user.githubId = userData.id.toString();
      if (userData.name) user.name = userData.name;
      if (userData.avatar_url) user.image = userData.avatar_url;
      if (userData.email && !user.email) user.email = userData.email; // Only update email if not already set
    }

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully:', { userId: user._id, githubUsername: user.githubUsername });

    // Redirect based on the type of authorization
    if (state === 'extended_permissions') {
      // Extended permissions - redirect to dashboard with success
      console.log('Redirecting to dashboard with extended permissions');
      return NextResponse.redirect('http://localhost:3000/dashboard?connected=github&permissions=extended');
    } else {
      // Basic auth - redirect to dashboard (initial login)
      console.log('Redirecting to dashboard with basic permissions');
      return NextResponse.redirect('http://localhost:3000/dashboard?connected=github&permissions=basic');
    }
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
