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
  return data.access_token;
}

async function getGitHubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Exchange code for access token
    const accessToken = await exchangeGitHubCode(
      code,
      process.env.GITHUB_ID!,
      process.env.GITHUB_SECRET!,
      process.env.GITHUB_REDIRECT_URI || 'http://localhost:4200/api/auth/github/callback'
    );

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 });
    }

    // Get user info
    const userData = await getGitHubUser(accessToken);

    // Connect to database
    await dbConnect();

    // Find or create user
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      user = new User({
        email: userData.email,
        name: userData.name || userData.login,
        image: userData.avatar_url,
        githubToken: encryptToken(accessToken),
        githubUsername: userData.login,
      });
    } else {
      user.githubToken = encryptToken(accessToken);
      user.githubUsername = userData.login;
      if (userData.name) user.name = userData.name;
      if (userData.avatar_url) user.image = userData.avatar_url;
    }

    await user.save();

    // Redirect to dashboard with success
    return NextResponse.redirect('http://localhost:4200/dashboard?connected=github');
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
