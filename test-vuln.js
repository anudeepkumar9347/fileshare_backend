// test-vuln.js
const express = require('express');
const app = express();

app.get('/danger', (req, res) => {
  const userInput = req.query.name;
  // 🚨 VULNERABLE: Unescaped input in response
  res.send(`Welcome ${userInput}`);
});

app.listen(3002, () => {
  console.log('Vulnerable test app running on http://localhost:3002');
});
