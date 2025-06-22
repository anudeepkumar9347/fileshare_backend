
 
// backend/vulnerable.js
const input = require('fs').readFileSync('/dev/stdin').toString();
eval(input); // vulnerable
