import { Octokit } from '@octokit/rest';
import { createAppAuth } from "@octokit/auth-app";
import fs from "fs";
import path from "path";

async function getOctokit() {
  const privateKeyPath = path.resolve(process.cwd(), process.env.GITHUB_PRIVATE_KEY_PATH!);
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");
  console.log(privateKey);
  const auth = createAppAuth({
    appId: process.env.GITHUB_APPID!,
    privateKey,
    installationId: process.env.GITHUB_INSTALLATION_ID!, // You get this after installing the app on a repo
  });

  const { token } = await auth({ type: "installation" });

  return new Octokit({ auth: token });
}




export async function fetchGitHubFiles(prData: any) {
  const owner = prData.repository.owner.login;
  const repo = prData.repository.name;
  const prNumber = prData.number;
  const octokit = await getOctokit();
  const { data } = await octokit.pulls.listFiles({ owner, repo, pull_number: prNumber });
console.log(`Fetching files for PR #${prNumber} in ${owner}/${repo}`);
  const files = await Promise.all(
    data.map(async (file) => {
      const blob = await octokit.repos.getContent({
        owner,
        repo,
        path: file.filename,
        ref: prData.pull_request.head.sha,
      });
      const content = Buffer.from((blob.data as any).content, 'base64').toString('utf-8');
      return { filename: file.filename, content };
    })
  );

  return files.filter(Boolean) as { filename: string; content: string }[];
}

export async function postGitHubComment(prData: any, body: string) {
  const owner = prData.repository.owner.login;
  const repo = prData.repository.name;
  const prNumber = prData.number;
  const octokit = await getOctokit(); 
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body,
  });
}

export async function approveGitHubPR(prData: any) {
  const owner = prData.repository.owner.login;
  const repo = prData.repository.name;
  const prNumber = prData.number;
  const octokit = await getOctokit();
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    event: 'APPROVE',
    body: '✅ Code looks good! Auto-approved by MCP bot.',
  });
}