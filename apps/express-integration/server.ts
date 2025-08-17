import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import { handlePRReview } from './src/reviewHandler';
import { exchangeGitHubCode, listGitHubRepos} from './src/providers/github';
import { exchangeBitbucketCode, listBitbucketRepos } from './src/providers/bitbucket';
import { validateLicenseKey } from '@automate/shared/auth';

const app = express();
app.use(express.json());

// License key validation middleware for enterprise distribution
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


app.get('/auth/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_AUTHID!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    scope: process.env.GITHUB_SCOPE || 'repo'
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

app.get('/auth/bitbucket', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.BITBUCKET_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.BITBUCKET_REDIRECT_URI!,
    scope: process.env.BITBUCKET_SCOPE || 'repository:read'
  });
  res.redirect(`https://bitbucket.org/site/oauth2/authorize?${params.toString()}`);
});

app.get('/auth/github/callback', async (req, res) => {
  const code = String(req.query.code || '');
  const token = await exchangeGitHubCode(code, process.env.GITHUB_AUTHID!, process.env.GITHUB_AUTHSECRET!, process.env.GITHUB_REDIRECT_URI!);
  res.json({ ok: true, provider: 'github', token });
});

app.get('/auth/bitbucket/callback', async (req, res) => {
  const code = String(req.query.code || '');
  const data = await exchangeBitbucketCode(code, process.env.BITBUCKET_CLIENT_ID!, process.env.BITBUCKET_CLIENT_SECRET!, process.env.BITBUCKET_REDIRECT_URI!, process.env.BITBUCKET_SCOPE || 'repository:read');
  res.json({ ok: true, provider: 'bitbucket', ...data });
});

app.get('/github/repos', async (req, res) => {
  const token = String(req.headers.authorization?.replace('Bearer ', '') || '');
  const repos = await listGitHubRepos(token);
  res.json(repos.map(r => ({ fullName: r.full_name, defaultBranch: r.default_branch })));
});

app.get('/bitbucket/repos', async (req, res) => {
  const token = String(req.headers.authorization?.replace('Bearer ', '') || '');
  const workspace = String(req.query.workspace || '');
  const repos = await listBitbucketRepos(token, workspace || undefined);
  res.json(repos.map((r: any) => ({ fullName: r.full_name, defaultBranch: r.mainbranch?.name || 'main' })));
});

// // —— Link a repo to poll ——
// app.post('/link', async (req, res) => {
//   const body = req.body as { provider: 'github'|'bitbucket'; fullName: string; defaultBranch: string; token: string; refreshToken?: string };
//   if (!body?.provider || !body?.fullName || !body?.defaultBranch || !body?.token) return res.status(400).json({ error: 'missing fields' });

//   const id = `${body.provider}:${body.fullName}`;
//   upsertRepo({ id, provider: body.provider, fullName: body.fullName, defaultBranch: body.defaultBranch, token: body.token, refreshToken: body.refreshToken });
//   res.json({ ok: true, id });
// });

// app.get('/linked', (_req, res) => {
//   res.json(listRepos());
// });

// // —— Manual poll trigger ——
// app.post('/poll', async (_req, res) => {
//   await pollOnce({ workDir: WORK_DIR, onChangeCmd: ON_CHANGE_CMD, github: {}, bb: { clientId: process.env.BITBUCKET_CLIENT_ID!, clientSecret: process.env.BITBUCKET_CLIENT_SECRET! } });
//   res.json({ ok: true });
// });

app.listen(3000, () => console.log('🚀 MCP bot running on http://localhost:3000'));