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
  console.log('Bitbucket token exchange response:', { success: !!data.access_token, error: data.error });
  return data.access_token;
}

async function getBitbucketUser(accessToken: string) {
  const response = await fetch('https://api.bitbucket.org/2.0/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  const data = await response.json();
  console.log('Bitbucket user data:', { uuid: data.uuid, username: data.username, email: data.email });
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    console.log('Bitbucket callback received:', { code: !!code, state });
    
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Exchange code for access token
    const accessToken = await exchangeBitbucketCode(
      code,
      process.env.BITBUCKET_CLIENT_ID!,
      process.env.BITBUCKET_CLIENT_SECRET!,
      process.env.BITBUCKET_REDIRECT_URI || 'http://localhost:3000/api/auth/bitbucket/callback'
    );

    if (!accessToken) {
      console.error('Failed to get Bitbucket access token');
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 });
    }

    console.log('Bitbucket access token received successfully');

    // Get user info
    const userData = await getBitbucketUser(accessToken);

    if (!userData.uuid) {
      console.error('Failed to get Bitbucket user data');
      return NextResponse.json({ error: 'Failed to get Bitbucket user data' }, { status: 400 });
    }

    // Connect to database
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');

    // Find or create user by Bitbucket ID (primary) or email (fallback)
    let user = await User.findOne({ 
      $or: [
        { bitbucketId: userData.uuid },
        ...(userData.email ? [{ email: userData.email }] : [])
      ]
    });
    
    console.log('User lookup result:', { found: !!user, bitbucketId: userData.uuid });
    
    if (!user) {
      // Create new user
      console.log('Creating new user...');
      user = new User({
        email: userData.email || undefined, // Only set if email exists
        name: userData.display_name || userData.username,
        image: userData.links?.avatar?.href,
        bitbucketToken: encryptToken(accessToken),
        bitbucketUsername: userData.username,
        bitbucketId: userData.uuid,
      });
    } else {
      // Update existing user
      console.log('Updating existing user...');
      user.bitbucketToken = encryptToken(accessToken);
      user.bitbucketUsername = userData.username;
      user.bitbucketId = userData.uuid;
      if (userData.display_name) user.name = userData.display_name;
      if (userData.links?.avatar?.href) user.image = userData.links.avatar.href;
      if (userData.email && !user.email) user.email = userData.email; // Only update email if not already set
    }

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully:', { userId: user._id, bitbucketUsername: user.bitbucketUsername });
    const base_url = process.env.SERVER_URL || 'http://localhost:3000' ;
    // Redirect based on the type of authorization
    if (state === 'extended_permissions') {
      // Extended permissions - redirect to dashboard with success
      console.log('Redirecting to dashboard with extended permissions');
      return NextResponse.redirect(`${base_url}/home?connected=bitbucket&permissions=extended`);
    } else {
      // Basic auth - redirect to dashboard (initial login)
      console.log('Redirecting to dashboard with basic permissions');
      return NextResponse.redirect(`${base_url}/home?connected=bitbucket&permissions=basic`);
    }
  } catch (error) {
    console.error('Bitbucket OAuth error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
