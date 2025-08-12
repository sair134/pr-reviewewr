import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { handlePRReview } from './src/reviewHandler';

const app = express();
app.use(express.json());

// GitHub Webhook
app.post('/webhook/github', async (req: Request, res: Response) => {
  const event = req.headers['x-github-event'];
  if (event === 'pull_request') {
    console.log('Received GitHub PR event');
    await handlePRReview('github', req.body);
  }
  res.sendStatus(200);
});

// Bitbucket Webhook
app.post('/webhook/bitbucket', async (req: Request, res: Response) => {
  const event = req.headers['x-event-key'];
  if (typeof event === 'string' && event.startsWith('pullrequest:')) {
    console.log('Received Bitbucket PR event');
    await handlePRReview('bitbucket', req.body);
  }
  res.sendStatus(200);
});

app.listen(3000, () => console.log('🚀 MCP bot running on http://localhost:3000'));