const nacl = require("libsodium-wrappers");

module.exports = () => {
  return Object.freeze({
    verify: (hashedPw, pw) => {
      return nacl.crypto_pwhash_str_verify(hashedPw, pw);
    }
  });
};
