 const express = require('express');
const app = express();

// ❌ Insecure use of eval (should trigger CodeQL alert)
app.get('/vuln/:data', (req, res) => {
  eval("console.log('Data: ' + '" + req.params.data + "')");
  res.send('Evaluated!');
});

app.listen(3000);

 