import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Repository from '@/models/Repository';
import { verifyWebhookSignature } from '@/lib/webhook-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || '';
    const event = request.headers.get('x-event-key');

    console.log('Received Bitbucket webhook:', { event, signature: signature.substring(0, 20) + '...' });

    // Connect to database
    await dbConnect();

    // Find the repository by webhook signature verification
    const repositories = await Repository.find({ 
      provider: 'bitbucket',
      isActive: true,
      webhookSecret: { $exists: true }
    });

    let verifiedRepo = null;
    for (const repo of repositories) {
      if (verifyWebhookSignature(body, signature, repo.webhookSecret!, 'bitbucket')) {
        verifiedRepo = repo;
        break;
      }
    }

    if (!verifiedRepo) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Verified webhook for repository: ${verifiedRepo.fullName}`);

    // Parse the webhook payload
    const payload = JSON.parse(body);

    // Handle pull request events
    if (event && event.startsWith('pullrequest:')) {
      const action = event.split(':')[1]; // e.g., 'created', 'updated', 'approved'
      const prData = payload.pullrequest;
      const repoData = payload.repository;

      console.log(`Bitbucket PR ${action} event for ${repoData.full_name} PR #${prData.id}`);

      // Forward to Express API for processing
      const expressUrl = `${process.env.EXPRESS_API_URL || 'http://localhost:3333'}/webhook/bitbucket`;
      
      try {
        const response = await fetch(expressUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Event-Key': event || '',
            'X-Hub-Signature-256': signature,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log(`Successfully forwarded Bitbucket webhook to Express API`);
        } else {
          console.error(`Express API returned error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error forwarding to Express API:', error);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Bitbucket webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
