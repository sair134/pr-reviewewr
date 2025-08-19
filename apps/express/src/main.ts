/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import express, { Request, Response } from 'express';
import * as path from 'path';
import { validateLicenseKey } from '@app/shared';
import { handlePRReview } from './reviewHandler';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to express!' });
});

app.use('/webhook/*', validateLicenseKey);
app.use('/github/*', validateLicenseKey);
app.use('/bitbucket/*', validateLicenseKey);

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


// OAuth and repository routes moved to Next.js app
// These routes are now handled by the Next.js frontend with MongoDB integration



const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
