import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import { encryptToken } from '../../../../../lib/encryption';

async function exchangeBitbucketCode(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  const response = await fetch('https://bitbucket.org/site/oauth2/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function getBitbucketUser(accessToken: string) {
  const response = await fetch('https://api.bitbucket.org/2.0/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
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
    const accessToken = await exchangeBitbucketCode(
      code,
      process.env.BITBUCKET_CLIENT_ID!,
      process.env.BITBUCKET_CLIENT_SECRET!,
      process.env.BITBUCKET_REDIRECT_URI || 'http://localhost:4200/api/auth/bitbucket/callback'
    );

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 });
    }

    // Get user info
    const userData = await getBitbucketUser(accessToken);

    // Connect to database
    await dbConnect();

    // Find or create user
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      user = new User({
        email: userData.email,
        name: userData.display_name || userData.username,
        image: userData.links?.avatar?.href,
        bitbucketToken: encryptToken(accessToken),
        bitbucketUsername: userData.username,
      });
    } else {
      user.bitbucketToken = encryptToken(accessToken);
      user.bitbucketUsername = userData.username;
      if (userData.display_name) user.name = userData.display_name;
      if (userData.links?.avatar?.href) user.image = userData.links.avatar.href;
    }

    await user.save();

    // Redirect to dashboard with success
    return NextResponse.redirect('http://localhost:4200/dashboard?connected=bitbucket');
  } catch (error) {
    console.error('Bitbucket OAuth error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
