const {STARTING_BALANCE}=require('../../config');
const {ec} = require('../utilities/elliptic');
const crypto_hash = require('../utilities/crypto-hash');

class Wallet{   

    constructor(){
        this.balance=STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey=this.keyPair.getPublic().encode('hex');
    };

    sign(data){
        return this.keyPair.sign(crypto_hash(data));
    };

};

module.exports=Wallet;