const nacl = require("libsodium-wrappers");
const Decryptor=require('./Decryptor.js');
const Encryptor=require('./Encryptor.js');

module.exports = async (peer) => {
  
  await nacl.ready;
  //generate public key and private key
  let keyPair = nacl.crypto_kx_keypair();
  global.message;
  let [pk, sk] = [keyPair.publicKey, keyPair.privateKey];
  let encryptor,decryptor;  
  if(peer == null){
    //Return a client object
    
    let clientObj={
      publicKey:pk,
      connection:null,
      encrypt: (msg)=>{
        return encryptor.encrypt(msg);
      },
      decrypt: (ciphertext, nonce)=>{
        return decryptor.decrypt(ciphertext,nonce);
      },
      send:(msg)=>{
        message=encryptor.encrypt(msg);
      },
      receive:(msg)=>{
        return decryptor.decrypt(message.ciphertext,message.nonce);
      },
      connect:async (peer)=>{
        this.connection=peer;
        let keysClient= nacl.crypto_kx_client_session_keys(pk,sk,peer.publicKey);
        encryptor=await Encryptor(keysClient.sharedTx);
        decryptor=await Decryptor(keysClient.sharedRx);
      }
      
    }
    
    
    return Object.freeze(clientObj);
  }else{
    let keysServer = nacl.crypto_kx_server_session_keys(pk,sk,peer.publicKey);
    const decryptor=await Decryptor(keysServer.sharedRx);
    const encryptor=await Encryptor(keysServer.sharedTx);
    //return a server object
    let serverObj={
      publicKey:pk,
      encryptionKey:keysServer.sharedTx,
      decryptionKey:keysServer.sharedRx,
      encrypt:(msg)=>{
        return encryptor.encrypt(msg);
      },
      decrypt:(ciphertext, nonce)=>{
        return decryptor.decrypt(ciphertext,nonce);
      },
      send:(msg)=>{
        message=encryptor.encrypt(msg);
      },
      receive:(msg)=>{
        return decryptor.decrypt(message.ciphertext,message.nonce);
      }
    }

    peer.connect(serverObj);
    return Object.freeze(serverObj);
  }   
}