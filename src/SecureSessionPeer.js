const nacl = require("libsodium-wrappers");
//const decryptor = require("../src/Decryptor");

module.exports = async (peer) => {
  await nacl.ready;

  //generate publicKey and private key
  let keyPair = nacl.crypto_kx_keypair();
  let [pk, sk] = [keyPair.publicKey, keyPair.privateKey];

  if (peer == null) {
    //create object that has to be returned
    obj = {};

    obj.publicKey = pk;

    //make privateKey unchangeable and secret
    let weakMap = new WeakMap();
    const privateKey = {};
    weakMap.set(privateKey, sk);

    //create function to be able to connect to server

    obj.connect = (peer) => {
      obj.connection = peer;
    };

    //"encrypt" functionality

    obj.encrypt = (msg) => {
      //generate efemeral keys
      let keys = nacl.crypto_kx_client_session_keys(
        obj.publicKey,
        sk,
        obj.connection.publicKey
      );

      let [encryptionKey, decryptionKey] = [keys.sharedTx, keys.sharedRx];

      //generate an IV
      let nonce = nacl.randombytes_buf(nacl.crypto_secretbox_NONCEBYTES); //initialization vector (Number used once)

      let ciphertext = nacl.crypto_secretbox_easy(msg, nonce, encryptionKey);

      res = {
        ciphertext: ciphertext,
        nonce: nonce,
      };

      return res;
    };

    obj.decrypt = (ciphertext, nonce) => {
      //generate efemeral keys
      let keys = nacl.crypto_kx_client_session_keys(
        obj.publicKey,
        weakMap.get(privateKey),
        obj.connection.publicKey
      );

      let [encryptionKey, decryptionKey] = [keys.sharedTx, keys.sharedRx];
      return nacl.crypto_secretbox_open_easy(ciphertext, nonce, decryptionKey);
    };

    obj.send = (msg) => {
      obj.connection.receive(msg);
    };

    let messageProp;
    obj.receive = (msg = null) => {
      if (msg == null) {
        let message = messageProp;
        messageProp = null;

        return message;
      } else {
        
        messageProp = msg;
        
      }
    };
    //return frozen object so it can't be changed afterwards
    Object.freeze(obj);
    return obj;
  } else {
    //create object that has to be returned
    obj = {};
    obj.publicKey = pk;
    //make privateKey unchangeable and secret
    let weakMap1 = new WeakMap();
    const privateKey1 = {};
    weakMap1.set(privateKey1, sk);

    peer.connect(obj);

    obj.encrypt = (msg) => {
      //generate efemeral keys

      let keys = nacl.crypto_kx_server_session_keys(
        obj.publicKey,
        weakMap1.get(privateKey1),
        peer.publicKey
      );

     
      let [encryptionKey, decryptionKey] = [keys.sharedTx, keys.sharedRx];

      //generate an IV
      let nonce = nacl.randombytes_buf(nacl.crypto_secretbox_NONCEBYTES); //initialization vector (Number used once)

      let ciphertext = nacl.crypto_secretbox_easy(msg, nonce, encryptionKey);

      res = {
        ciphertext: ciphertext,
        nonce: nonce,
      };

      return res;
    };

    obj.decrypt = (ciphertext, nonce) => {
      //generate efemeral keys
      let keys = nacl.crypto_kx_server_session_keys(
        obj.publicKey,
        weakMap1.get(privateKey1),
        peer.publicKey
      );
      //console.log(keys)
      let [encryptionKey, decryptionKey] = [keys.sharedTx, keys.sharedRx];
      return nacl.crypto_secretbox_open_easy(ciphertext, nonce, decryptionKey);
    };

    obj.send = (msg) => {
      peer.receive(msg);
    };
    let messageProp;
    obj.receive = (msg = null) => {
      if (msg == null) {
        let message = messageProp;
        messageProp = null;
        return message;
      } else {
        messageProp = msg;
      }
    };

    //return frozen object so it can't be changed afterwards
    Object.freeze(obj);
    return obj;
  }

};
