import { Octokit } from '@octokit/rest';
import axios from 'axios';
import crypto from 'crypto';

// Generate a random webhook secret
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// GitHub webhook creation
export async function createGitHubWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  webhookUrl: string,
  webhookSecret: string
): Promise<{ webhookId: string; webhookUrl: string }> {
  const octokit = new Octokit({
    auth: accessToken,
  });

  try {
    const webhook = await octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: webhookSecret,
        insecure_ssl: process.env.NODE_ENV === 'development' ? '1' : '0',
      },
      events: ['pull_request'],
      active: true,
    });

    return {
      webhookId: webhook.data.id?.toString() || '',
      webhookUrl: webhook.data.config?.url || webhookUrl,
    };
  } catch (error) {
    console.error('Error creating GitHub webhook:', error);
    throw new Error(`Failed to create GitHub webhook: ${error}`);
  }
}

// Bitbucket webhook creation
export async function createBitbucketWebhook(
  accessToken: string,
  workspace: string,
  repoSlug: string,
  webhookUrl: string,
  webhookSecret: string
): Promise<{ webhookId: string; webhookUrl: string }> {
  try {
    const response = await axios.post(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/hooks`,
      {
        description: 'PR Review Webhook',
        url: webhookUrl,
        active: true,
        events: ['pullrequest:created', 'pullrequest:updated', 'pullrequest:approved', 'pullrequest:unapproved'],
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      webhookId: response.data.uuid,
      webhookUrl: response.data.url,
    };
  } catch (error) {
    console.error('Error creating Bitbucket webhook:', error);
    throw new Error(`Failed to create Bitbucket webhook: ${error}`);
  }
}

// Delete GitHub webhook
export async function deleteGitHubWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  webhookId: string
): Promise<void> {
  const octokit = new Octokit({
    auth: accessToken,
  });

  try {
    await octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: parseInt(webhookId),
    });
  } catch (error) {
    console.error('Error deleting GitHub webhook:', error);
    throw new Error(`Failed to delete GitHub webhook: ${error}`);
  }
}

// Delete Bitbucket webhook
export async function deleteBitbucketWebhook(
  accessToken: string,
  workspace: string,
  repoSlug: string,
  webhookId: string
): Promise<void> {
  try {
    await axios.delete(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/hooks/${webhookId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error deleting Bitbucket webhook:', error);
    throw new Error(`Failed to delete Bitbucket webhook: ${error}`);
  }
}

// Verify webhook signature (for incoming webhooks)
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  provider: 'github' | 'bitbucket'
): boolean {
  if (provider === 'github') {
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')}`;
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } else if (provider === 'bitbucket') {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
  return false;
}
