import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const params = new URLSearchParams({
    client_id: process.env.BITBUCKET_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.BITBUCKET_REDIRECT_URI || 'http://localhost:4200/api/auth/bitbucket/callback',
    scope: process.env.BITBUCKET_SCOPE || 'repository:read',
  });
  
  const authUrl = `https://bitbucket.org/site/oauth2/authorize?${params.toString()}`;
  
  return NextResponse.redirect(authUrl);
}

