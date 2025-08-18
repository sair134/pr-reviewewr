import axios from 'axios';

export async function exchangeGitHubCode(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  console.log(code, clientId, clientSecret, redirectUri)
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const {data} = await axios.post(
    'https://github.com/login/oauth/access_token',
    params,
    { headers: { Accept: 'application/json',  "Content-Type": "application/x-www-form-urlencoded", } }
  );
  return data; // { access_token, scope, token_type }
}

export async function listGitHubRepos(token: string) {
  const { data } = await axios.get('https://api.github.com/user/repos?per_page=100', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
  });
  return data as any[];
}

export async function getGitHubBranch(token: string, owner: string, repo: string, branch: string) {
  const { data } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
  });
  return data; // contains commit.sha
}