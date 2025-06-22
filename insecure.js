 const express = require('express');
const app = express();

app.get('/user/:id', function (req, res) {
  // ❌ Insecure: unsanitized user input in dynamic code
  eval("console.log('User ID: " + req.params.id + "')");
  res.send('User page');
}); 

app.listen(3000);
 
