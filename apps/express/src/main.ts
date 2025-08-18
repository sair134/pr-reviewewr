/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import express, { Request, Response } from 'express';
import * as path from 'path';
import { validateLicenseKey } from '@app/shared';
import { handlePRReview } from './reviewHandler';
import { exchangeGitHubCode, listGitHubRepos } from './providers/github';
import { exchangeBitbucketCode, listBitbucketRepos } from './providers/bitbucket';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to express!' });
});

app.use('/webhook/*', validateLicenseKey);
app.use('/auth/*', validateLicenseKey);
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


app.get('/auth/github', (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env['GITHUB_AUTHID']!,
    redirect_uri: process.env['GITHUB_REDIRECT_URI']!,
    scope: process.env['GITHUB_SCOPE'] || 'repo'
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

app.get('/auth/bitbucket', (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env['BITBUCKET_CLIENT_ID']!,
    response_type: 'code',
    redirect_uri: process.env['BITBUCKET_REDIRECT_URI']!,
    scope: process.env['BITBUCKET_SCOPE'] || 'repository:read'
  });
  res.redirect(`https://bitbucket.org/site/oauth2/authorize?${params.toString()}`);
});

app.get('/auth/github/callback', async (req: Request, res: Response) => {
  const code = String(req.query['code'] || '');
  const token = await exchangeGitHubCode(code, process.env['GITHUB_AUTHID']!, process.env['GITHUB_AUTHSECRET']!, process.env['GITHUB_REDIRECT_URI']!);
  res.json({ ok: true, provider: 'github', token });
});

app.get('/auth/bitbucket/callback', async (req: Request, res: Response) => {
  const code = String(req.query['code'] || '');
  const data = await exchangeBitbucketCode(code, process.env['BITBUCKET_CLIENT_ID']!, process.env['BITBUCKET_CLIENT_SECRET']!, process.env['BITBUCKET_REDIRECT_URI']!, process.env['BITBUCKET_SCOPE'] || 'repository:read');
  res.json({ ok: true, provider: 'bitbucket', ...data });
});

app.get('/github/repos', async (req: Request, res: Response) => {
  const token = String(req.headers.authorization?.replace('Bearer ', '') || '');
  const repos = await listGitHubRepos(token);
  res.json(repos.map(r => ({ fullName: r.full_name, defaultBranch: r.default_branch })));
});

app.get('/bitbucket/repos', async (req: Request, res: Response) => {
  const token = String(req.headers.authorization?.replace('Bearer ', '') || '');
  const workspace = String(req.query['workspace'] || '');
  const repos = await listBitbucketRepos(token, workspace || undefined);
  res.json(repos.map((r: any) => ({ fullName: r.full_name, defaultBranch: r.mainbranch?.name || 'main' })));
});



const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
