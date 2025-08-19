import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { decryptToken } from '../../../../lib/encryption';

async function getGitHubRepos(accessToken: string) {
  const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
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
    
    // Connect to database
    await dbConnect();
    
    // Find user by token (in a real app, you'd validate the JWT token)
    const user = await User.findOne({ githubToken: token });
    
    if (!user || !user.githubToken) {
      return NextResponse.json({ error: 'User not found or GitHub not connected' }, { status: 404 });
    }

    // Decrypt the token and fetch repositories from GitHub
    const decryptedToken = decryptToken(user.githubToken);
    const repos = await getGitHubRepos(decryptedToken);
    
    // Format the response
    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      defaultBranch: repo.default_branch,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      updatedAt: repo.updated_at,
      language: repo.language,
    }));

    return NextResponse.json(formattedRepos);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
