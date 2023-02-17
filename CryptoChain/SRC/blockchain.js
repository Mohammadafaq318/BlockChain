const Block = require("./block");
const cryptoHash = require("./crypto-hash");

class Blockchain{
    constructor(){
        this.chain=[Block.genesis()]
    };

    addBlock({data}){
        const newBlock = Block.minedBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain){
        if(chain.length<=this.chain.length){
            console.error('incoming chain must be longer');
            return;
        }

        if(!Blockchain.isValidChain(chain)){
            console.error('incoming chain must be valid');
            return;
        }

        console.log('replacing chain with',chain);
        this.chain=chain;
    };

    static isValidChain(chain){

        if (JSON.stringify(chain[0])!== JSON.stringify(Block.genesis())){
            return false;
        }

        for(let i =1; i<chain.length;i++){
            const {timestamp,lastHash,hash,data,nonce,difficulty}=chain[i];
            const actualLastHash=chain[i-1].hash;
            
            if(lastHash!==actualLastHash){
                return false;
            }

            const actualHash=cryptoHash(timestamp,lastHash,data,nonce,difficulty);

            if(hash!==actualHash){
                return false;
            }
        }

        return true;
    };


};

module.exports= Blockchain;