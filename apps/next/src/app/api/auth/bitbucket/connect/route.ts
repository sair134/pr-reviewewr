import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const params = new URLSearchParams({
    client_id: process.env.BITBUCKET_CLIENT_ID!,
    redirect_uri: process.env.BITBUCKET_REDIRECT_URI || 'http://localhost:3000/api/auth/bitbucket/callback',
    response_type: 'code',
    state: 'extended_permissions', // Add state to distinguish this from basic auth
  });
  
  const authUrl = `https://bitbucket.org/site/oauth2/authorize?${params.toString()}`;
  
  return NextResponse.redirect(authUrl);
}
