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

    createTransaction({recipient,amount,chain}){

        if(chain){
            this.balance=Wallet.calculateBalance({chain,address: this.publicKey});
        }

        if(amount>this.balance){
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({senderWallet: this,recipient,amount});
    };

    static calculateBalance({chain,address}){

        let hasConductedTransaction=false;
        let outputTotal= 0;

        for (let i=chain.length-1;i>0;i--){
            const block = chain[i];
            for(let transaction of block.data){

                if(transaction.input.address==address){
                    hasConductedTransaction=true;

                };


                const addressOutput=transaction.outputMap[address];

                if(addressOutput){
                    outputTotal=outputTotal+addressOutput;
                }
            }

            if(hasConductedTransaction){
                break;
            }
        }
        return hasConductedTransaction ? 
            outputTotal:
            STARTING_BALANCE + outputTotal;
    };
};

module.exports=Wallet;