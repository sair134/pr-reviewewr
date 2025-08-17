import axios from 'axios';
import qs from 'qs';

export async function exchangeBitbucketCode(code: string, clientId: string, clientSecret: string, redirectUri: string, scope: string) {
  const { data } = await axios.post(
    'https://bitbucket.org/site/oauth2/access_token',
    qs.stringify({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
    { auth: { username: clientId, password: clientSecret }, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data; // { access_token, refresh_token, expires_in, ... }
}

export async function refreshBitbucketToken(refreshToken: string, clientId: string, clientSecret: string) {
  const { data } = await axios.post(
    'https://bitbucket.org/site/oauth2/access_token',
    qs.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    { auth: { username: clientId, password: clientSecret }, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data; // { access_token, refresh_token, ... }
}

export async function listBitbucketRepos(token: string, workspace?: string) {
  const repos: any[] = [];
  let url = workspace
    ? `https://api.bitbucket.org/2.0/repositories/${workspace}?pagelen=100`
    : `https://api.bitbucket.org/2.0/repositories?role=member&pagelen=100`;
  while (url) {
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    repos.push(...data.values);
    url = data.next;
  }
  return repos;
}

export async function getBitbucketBranch(token: string, workspace: string, repo: string, branch: string) {
  const { data } = await axios.get(
    `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo}/refs/branches/${encodeURIComponent(branch)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data; // { target: { hash } }
}