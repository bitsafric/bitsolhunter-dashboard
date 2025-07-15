const crypto = require('crypto');

// Generate a random 64-byte key and convert it to a hexadecimal string
const secretKey = crypto.randomBytes(64).toString('hex');

// Print the generated secret key to the console
console.log('Generated Secret Key:', secretKey);

