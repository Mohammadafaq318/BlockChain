const EC = require('elliptic').ec;
const crypto_hash = require('./crypto-hash');
const ec = new EC('secp256k1');


const verifySignature = ({ publicKey, data, signature }) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
  
    return keyFromPublic.verify(crypto_hash(data), signature);
  };
  
module.exports = { ec , verifySignature, crypto_hash};




