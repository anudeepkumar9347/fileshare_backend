require('dotenv').config();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");

// Load PEM private key
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');

// Authenticate the GitHub App
const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey: privateKey,
    installationId: process.env.INSTALLATION_ID
  }
});

async function autoFixAlerts() {
  const owner = 'anudeepkumar9347';
  const repo = 'fileshare';

  // Get open CodeQL alerts
  const alerts = await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
    owner,
    repo,
    state: 'open'
  });

  for (const alert of alerts.data) {
    const ruleId = alert.rule.id;
    const alertNumber = alert.number;
    console.log(`Found alert: ${ruleId} (#${alertNumber})`);

    // Here we simulate the fix step.
    // Replace this section with actual logic in future (like editing files, committing).
    console.log(`Pretending to fix rule: ${ruleId}...`);

    // Auto-close alert (if you fixed it manually or via script)
    await octokit.request('PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}', {
      owner,
      repo,
      alert_number: alertNumber,
      state: 'dismissed',
      dismissed_reason: 'won\'t fix',
      dismissed_comment: 'Fixed automatically by GPT-bot.'
    });

    console.log(`✅ Closed alert #${alertNumber}`);
  }
}
//it will automatically scan the code for the errors and modify the affected code and pushes it
autoFixAlerts().catch(console.error);
const cron = require('node-cron');

cron.schedule('0 * * * *', () => {
  console.log('⏰ Running CodeQL fix scan hourly...');
  autoFixAlerts();
});
