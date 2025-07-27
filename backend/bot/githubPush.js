// githubPush.js
const { Octokit } = require("@octokit/core");
const { createAppAuth } = require("@octokit/auth-app");
const fs = require('fs');

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey,
    installationId: process.env.INSTALLATION_ID,
  }
});

async function pushFixToGitHub(owner, repo, branch, filePath, updatedContent, commitMessage) {
  const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo,
    path: filePath,
    ref: branch
  });

  const contentBase64 = Buffer.from(updatedContent).toString('base64');

  await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo,
    path: filePath,
    message: commitMessage,
    content: contentBase64,
    sha: fileData.sha,
    branch
  });
}

module.exports = { pushFixToGitHub };
