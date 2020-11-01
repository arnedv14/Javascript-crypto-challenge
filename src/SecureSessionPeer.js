const nacl = require("libsodium-wrappers");
const Decryptor = require("./Decryptor.js");
const Encryptor = require("./Encryptor.js");

module.exports = async (otherPeer) => {
  await nacl.ready;
  //generate public key and private key
  let keyPair = nacl.crypto_kx_keypair();
  //create a global variable 'message' used to exchange messages
  global.message;

  //create variables to store the instances of encryptor and decryptor once an otherPeer is defined
  let encryptor, decryptor;

  //create object to return
  let peerObject = {
    publicKey: keyPair.publicKey,
    encrypt: (msg) => {
      return encryptor.encrypt(msg);
    },
    decrypt: (ciphertext, nonce) => {
      return decryptor.decrypt(ciphertext, nonce);
    },
    send: (msg) => {
      message = encryptor.encrypt(msg);
    },
    receive: () => {
      return decryptor.decrypt(message.ciphertext, message.nonce);
    },
    connect: async (otherPeer) => {
      let keysClient = nacl.crypto_kx_client_session_keys(
        keyPair.publicKey,
        keyPair.privateKey,
        otherPeer.publicKey
      );
      encryptor = await Encryptor(keysClient.sharedTx);
      decryptor = await Decryptor(keysClient.sharedRx);
    },
  };

  Object.freeze(peerObject);

  //Set encryption- and decrpytion keys when the peer is a server-instance
  if (otherPeer != null) {
    let keysServer = nacl.crypto_kx_server_session_keys(
      keyPair.publicKey,
      keyPair.privateKey,
      otherPeer.publicKey
    );

    decryptor = await Decryptor(keysServer.sharedRx);
    encryptor = await Encryptor(keysServer.sharedTx);

    //initialize encryption- and decryption keys in client-instance
    otherPeer.connect(peerObject);
  }

  return peerObject;
};
