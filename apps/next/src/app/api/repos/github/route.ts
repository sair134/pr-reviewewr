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
    const errorText = await response.text();
    console.error('GitHub API error:', response.status, errorText);
    throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
  }

  const repos = await response.json();
  console.log(`Fetched ${repos.length} repositories from GitHub`);
  return repos;
}

export async function GET(request: NextRequest) {
  try {
    console.log('GitHub repos API called');
    
    // Connect to database
    await dbConnect();
    console.log('Database connected for repos fetch');
    
    // For now, we'll get the first user with a GitHub token
    // In a real app, you'd get the user from the session/JWT
    const user = await User.findOne({ githubToken: { $exists: true, $ne: null } });
    
    if (!user || !user.githubToken) {
      console.log('No user found with GitHub token');
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 404 });
    }

    console.log('Found user with GitHub token:', user.githubUsername);

    // Decrypt the token and fetch repositories from GitHub
    const decryptedToken = decryptToken(user.githubToken);
    console.log('Token decrypted successfully');
    
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

    console.log(`Returning ${formattedRepos.length} formatted repositories`);
    return NextResponse.json(formattedRepos);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
