import crypto from 'crypto';

function generateUid(text) {
  // Create a hash object with the SHA-256 algorithm
  const hash = crypto.createHash('sha256');
  
  // Update the hash object with the input text
  hash.update(text);
  
  // Generate a hex-encoded digest of the hash
  const digest = hash.digest('hex');
  
  // Return the first 16 characters of the digest as the UID
  return digest.substr(0, 32);
}

export {
    generateUid
}

// // Example usage
// const uid = generateUid('hello world');
// console.log(uid); // Output: 533b8a8c1dbd9d6f
