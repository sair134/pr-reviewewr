import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_AUTH_CLIENT!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/github/callback',
    scope: process.env.GITHUB_SCOPE || 'repo admin:repo_hook issues read:org',
    state: 'extended_permissions', // Add state to distinguish this from basic auth
  });
  
  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  
  return NextResponse.redirect(authUrl);
}
