const {STARTING_BALANCE}=require('../../config');
const {ec,crypto_hash} = require('../utilities/elliptic');
const Transaction = require('../wallet/transaction');

class Wallet{   

    constructor(){
        this.balance=STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey=this.keyPair.getPublic().encode('hex');
    };

    sign(data){
        return this.keyPair.sign(crypto_hash(data));
    };

    createTransaction({recipient,amount}){

        if(amount>this.balance){
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({senderWallet: this,recipient,amount});
    };

};

module.exports=Wallet;