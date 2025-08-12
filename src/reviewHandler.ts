import { postGitHubComment, fetchGitHubFiles, approveGitHubPR } from './platforms/github';
import { postBitbucketComment, fetchBitbucketFiles, approveBitbucketPR } from './platforms/bitbucket';
import { analyzeFile } from './orchestrator';

async function reviewWithAI(code: string): Promise<string> {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'codellama:7b',
      prompt: `Review the following TypeScript code for issues, bugs, or improvements:\n\n${code}`,
      stream: false,
    }),
  });
  const data = await res.json() as { response: string };
  return data.response;
}

export async function handlePRReview(platform: 'github' | 'bitbucket', prData: any) {
  let files: { filename: string; content: string }[] = [];

  if (platform === 'github') {
    files = await fetchGitHubFiles(prData);
  } else {
    files = await fetchBitbucketFiles(prData);
  }

  const results = await Promise.all(
    files.map(async (file) => {
      const issues = await analyzeFile(file.content, file.filename);
      const aiFeedback = await reviewWithAI(file.content);
      return {
        filename: file.filename,
        issues,
        aiFeedback,
      };
    })
  );

  const hasIssues = results.some((r) => (r.issues && r.issues.length > 0) || r.aiFeedback.toLowerCase().includes('issue'));

const body = results
    .map(
      (res) =>
        `### ${res.filename}\n\n` +
        '```txt\n' +
        (res.issues && res.issues.length > 0
          ? `Static Analysis:\n${res.issues
              .map((i) => `${i.file}:${i.line}:${i.col} ${i.severity.toUpperCase()} ${i.message} (${i.rule ?? 'unknown'})`)
              .join('\n')}\n`
          : '✅ Static Analysis: No issues\n') +
        `\nAI Review:\n${res.aiFeedback}\n` +
        '```'
    )
    .join('\n');

  if (platform === 'github') {
    await postGitHubComment(prData, body);
    console.log(`Posted GitHub comment for PR #${prData.number}`);
    if (!hasIssues) await approveGitHubPR(prData);
  } else {
    await postBitbucketComment(prData, body);
    console.log(`Posted Bitbucket comment for PR #${prData.pullrequest.id}`);
    if (!hasIssues) await approveBitbucketPR(prData);
  }
}