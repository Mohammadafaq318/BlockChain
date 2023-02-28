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

    static calculateBalance({chain,address}){
        let outputTotal= 0;

        for (let i=1;i<chain.length;i++){
            const block = chain[i];
            for(let transaction of block.data){
                const addressOutput=transaction.outputMap[address];

                if(addressOutput){
                    outputTotal=outputTotal+addressOutput;
                }
            }
        }
        return STARTING_BALANCE + outputTotal;
    };
};

module.exports=Wallet;