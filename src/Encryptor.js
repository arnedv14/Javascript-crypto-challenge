const nacl = require("libsodium-wrappers");

module.exports = (key) => {
  if (!key) {
    throw "no key";
  } else {
    return Object.freeze({
      encrypt: (msg) => {
        let nonce=nacl.randombytes_buf(nacl.crypto_secretbox_NONCEBYTES);
        return {
          ciphertext: nacl.crypto_secretbox_easy(msg, nonce, key),
          nonce: nonce,
        };
      },
    });
  }
};
