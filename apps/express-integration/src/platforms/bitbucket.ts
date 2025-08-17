import axios from 'axios';

const BITBUCKET_TOKEN = process.env.BITBUCKET_TOKEN; // store your OAuth token here
const BITBUCKET_EMAIL = process.env.BITBUCKET_EMAIL;



const basicAuth = Buffer.from(`${BITBUCKET_EMAIL}:${BITBUCKET_TOKEN}`).toString('base64');
const authHeader = {
  Authorization: `Basic ${basicAuth}`,
  Accept: 'application/json',
};


export async function fetchBitbucketFiles(prData: any) {
  const repoSlug = prData.repository.full_name.split('/')[1];
  const workspace =
    prData.repository.workspace?.slug ||
    prData.repository.full_name.split('/')[0];
  const prId = prData.pullrequest.id;
  const commitHash = prData.pullrequest.source.commit.hash;
  console.log(`Fetching files for PR #${prId} in ${workspace}/${repoSlug} ${commitHash}`);
  // Get diffstat
  const { data } = await axios.get(
    `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/diffstat/${commitHash}`,
    { headers: authHeader }
  );

  // Fetch each changed file
  const files = await Promise.all(
    data.values.map(async (file: any) => {
      const rawUrl = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/src/${commitHash}/${file.new?.path}`;
      const res = await axios.get(rawUrl, { headers: authHeader });
      return {
        filename: file.new?.path,
        content: res.data,
      };
    })
  );

  return files
}

export async function postBitbucketComment(prData: any, body: string) {
  const repoSlug = prData.repository.full_name.split('/')[1];
  const workspace =
    prData.repository.workspace?.slug ||
    prData.repository.full_name.split('/')[0];
  const prId = prData.pullrequest.id;

  await axios.post(
    `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests/${prId}/comments`,
    { content: { raw: body } },
    { headers: authHeader }
  );
}

export async function approveBitbucketPR(prData: any) {
  const repoSlug = prData.repository.full_name.split('/')[1];
  const workspace =
    prData.repository.workspace?.slug ||
    prData.repository.full_name.split('/')[0];
  const prId = prData.pullrequest.id;

  await axios.post(
    `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests/${prId}/approve`,
    {},
    { headers: authHeader }
  );
}