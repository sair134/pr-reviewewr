import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { decryptToken } from '../../../../lib/encryption';

async function getBitbucketRepos(accessToken: string, workspace?: string) {
  const workspaceParam = workspace || 'user';
  const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${workspaceParam}?pagelen=100&sort=-updated_on`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Bitbucket API error: ${response.status}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const workspace = searchParams.get('workspace');
    
    // Connect to database
    await dbConnect();
    
    // Find user by token (in a real app, you'd validate the JWT token)
    const user = await User.findOne({ bitbucketToken: token });
    
    if (!user || !user.bitbucketToken) {
      return NextResponse.json({ error: 'User not found or Bitbucket not connected' }, { status: 404 });
    }

    // Decrypt the token and fetch repositories from Bitbucket
    const decryptedToken = decryptToken(user.bitbucketToken);
    const reposData = await getBitbucketRepos(decryptedToken, workspace || undefined);
    
    // Format the response
    const formattedRepos = reposData.values.map((repo: any) => ({
      id: repo.uuid,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.is_private,
      defaultBranch: repo.mainbranch?.name || 'main',
      htmlUrl: repo.links.html.href,
      cloneUrl: repo.links.clone.find((link: any) => link.name === 'https')?.href,
      updatedAt: repo.updated_on,
      language: repo.language,
      workspace: repo.workspace?.slug,
    }));

    return NextResponse.json(formattedRepos);
  } catch (error) {
    console.error('Error fetching Bitbucket repos:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
