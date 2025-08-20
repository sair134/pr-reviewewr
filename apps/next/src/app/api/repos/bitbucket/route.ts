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
    const errorText = await response.text();
    console.error('Bitbucket API error:', response.status, errorText);
    throw new Error(`Bitbucket API error: ${response.status} - ${errorText}`);
  }

  const reposData = await response.json();
  console.log(`Fetched ${reposData.values?.length || 0} repositories from Bitbucket`);
  return reposData;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Bitbucket repos API called');
    
    // Connect to database
    await dbConnect();
    console.log('Database connected for Bitbucket repos fetch');
    
    // For now, we'll get the first user with a Bitbucket token
    // In a real app, you'd get the user from the session/JWT
    const user = await User.findOne({ bitbucketToken: { $exists: true, $ne: null } });
    
    if (!user || !user.bitbucketToken) {
      console.log('No user found with Bitbucket token');
      return NextResponse.json({ error: 'Bitbucket not connected' }, { status: 404 });
    }

    console.log('Found user with Bitbucket token:', user.bitbucketUsername);

    // Decrypt the token and fetch repositories from Bitbucket
    const decryptedToken = decryptToken(user.bitbucketToken);
    console.log('Bitbucket token decrypted successfully');
    
    const reposData = await getBitbucketRepos(decryptedToken);
    
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

    console.log(`Returning ${formattedRepos.length} formatted Bitbucket repositories`);
    return NextResponse.json(formattedRepos);
  } catch (error) {
    console.error('Error fetching Bitbucket repos:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
