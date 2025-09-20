import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Repository from '@/models/Repository';
import { decryptToken } from '@/lib/encryption';
import { 
  createGitHubWebhook, 
  createBitbucketWebhook, 
  generateWebhookSecret 
} from '@/lib/webhook-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, repositoryId, repositoryData } = body;

    if (!provider || !repositoryId || !repositoryData) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, repositoryId, repositoryData' },
        { status: 400 }
      );
    }

    if (!['github', 'bitbucket'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be github or bitbucket' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get user with the appropriate token
    const tokenField = provider === 'github' ? 'githubToken' : 'bitbucketToken';
    const user = await User.findOne({ [tokenField]: { $exists: true, $ne: null } });

    if (!user || !user[tokenField as keyof typeof user]) {
      return NextResponse.json(
        { error: `${provider} not connected` },
        { status: 404 }
      );
    }

    // Check if repository already exists
    const existingRepo = await Repository.findOne({
      id: repositoryId,
      provider,
      userId: user._id,
    });

    if (existingRepo) {
      return NextResponse.json(
        { 
          error: 'Repository already has webhook configured',
          repository: existingRepo 
        },
        { status: 409 }
      );
    }

    // Decrypt the access token
    const accessToken = decryptToken(user[tokenField as keyof typeof user] as string);

    // Generate webhook secret
    const webhookSecret = generateWebhookSecret();

    // Determine webhook URL based on environment
    const baseUrl = process.env.WEBHOOK_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const webhookUrl = `${baseUrl}/webhooks/${provider}`;

    let webhookResult;

    // Create webhook based on provider
    if (provider === 'github') {
      const [owner, repo] = repositoryData.fullName.split('/');
      console.log(`Creating GitHub webhook for ${owner}/${repo} with URL: ${webhookUrl}`);
      webhookResult = await createGitHubWebhook(
        accessToken,
        owner,
        repo,
        webhookUrl,
        webhookSecret
      );
    } else {
      // Bitbucket
      const workspace = repositoryData.workspace || repositoryData.fullName.split('/')[0];
      const repoSlug = repositoryData.name;
      webhookResult = await createBitbucketWebhook(
        accessToken,
        workspace,
        repoSlug,
        webhookUrl,
        webhookSecret
      );
    }

    // Save repository details to database
    const repository = new Repository({
      id: repositoryId,
      name: repositoryData.name,
      fullName: repositoryData.fullName,
      description: repositoryData.description,
      private: repositoryData.private,
      defaultBranch: repositoryData.defaultBranch,
      htmlUrl: repositoryData.htmlUrl,
      cloneUrl: repositoryData.cloneUrl,
      language: repositoryData.language,
      provider,
      workspace: repositoryData.workspace,
      webhookId: webhookResult.webhookId,
      webhookUrl: webhookResult.webhookUrl,
      webhookSecret,
      userId: user._id,
      isActive: true,
    });

    await repository.save();

    return NextResponse.json({
      success: true,
      message: `Webhook created successfully for ${provider} repository`,
      repository: {
        id: repository._id,
        name: repository.name,
        fullName: repository.fullName,
        provider: repository.provider,
        webhookId: repository.webhookId,
        isActive: repository.isActive,
      },
    });

  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get all webhooks for a user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // For now, get the first user with any token
    // In a real app, you'd get the user from the session/JWT
    const user = await User.findOne({
      $or: [
        { githubToken: { $exists: true, $ne: null } },
        { bitbucketToken: { $exists: true, $ne: null } }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No user found' },
        { status: 404 }
      );
    }

    const repositories = await Repository.find({ userId: user._id });

    return NextResponse.json({
      success: true,
      repositories: repositories.map(repo => ({
        id: repo.id, // Use the original repository ID, not MongoDB _id
        name: repo.name,
        fullName: repo.fullName,
        provider: repo.provider,
        webhookId: repo.webhookId,
        isActive: repo.isActive,
        createdAt: repo.createdAt,
      })),
    });

  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}
