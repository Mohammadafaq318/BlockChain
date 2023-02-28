const Blockchain = require('../SRC/blockchain/blockchain');
const Block = require("../SRC/blockchain/block");
const {crypto_hash} = require('../SRC/utilities/elliptic');
const Transaction = require('../SRC/wallet/transaction');
const Wallet=require('../SRC/wallet/wallet')

describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(()=>{
        blockchain= new Blockchain();
        newChain= new Blockchain();

        originalChain=blockchain.chain;

        errorMock= jest.fn();
        global.console.error = errorMock;
    });

    it('contains a ´chain´ array instance',()=>{
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to chain',()=>{
        const newData='foo bar';
        blockchain.addBlock({data: newData});
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()',()=>{
        
        describe('when the chain does not start with the genesis block',()=>{
            it('returns false',()=>{
                blockchain.chain[0]={data:'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain does start with the genesis block and has multiple blocks',()=>{

            beforeEach(()=>{
                blockchain.addBlock({data:'bears'});
                blockchain.addBlock({data:'beart'});
                blockchain.addBlock({data:'beats'});

            });

            describe('and a lastHash reference has changed',()=>{
                it('returns false',()=>{
                    blockchain.chain[2].lastHash='broken-lastHash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with an invalid field',()=>{
                it('returns false',()=>{
                    blockchain.chain[2].data='bad data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with a jumped difficulty',()=>{
                it('returns false',()=>{
                    const lastBlock=blockchain.chain[blockchain.chain.length-1];
                    const lastHash=lastBlock.hash;
                    const nonce=0;
                    const timestamp=Date.now();
                    const data=[];
                    const difficulty=lastBlock.difficulty-3;

                    const hash=crypto_hash(timestamp,lastHash,difficulty, nonce,data);
                    const badBlock=new Block({timestamp,lastHash,difficulty,nonce,data});

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks',()=>{
                it('returns true',()=>{
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()',()=>{
        let errorMock, logMock;

        beforeEach(()=>{
            errorMock=jest.fn();
            logMock=jest.fn();

            global.console.error=errorMock;
            global.console.log=logMock; //quites the output of console error and log while testing
        });

        describe('when the new chain is not longer',()=>{
            beforeEach(()=>{
                newChain.chain[0]={new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });


            it('does not replace the chain',()=>{
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error',()=>{
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer',()=>{

            beforeEach(()=>{
                newChain.addBlock({data:'Bears'});
                newChain.addBlock({data:'Beats'});
                newChain.addBlock({data:'Beafs'});
            });

            describe('and the chain is invalid',()=>{

                beforeEach(()=>{
                    newChain.chain[2].hash='some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                });
                it('does not replace the chain',()=>{
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error',()=>{
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the chain is valid',()=>{

                beforeEach(()=>{
                    blockchain.replaceChain(newChain.chain);
                });
                it('replaces the chain',()=>{
                    expect(blockchain.chain).toEqual(newChain.chain);
                });
                it('logs an error',()=>{
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });

        describe('and the validateTransactions flag is true',()=>{
            it('calls validTransactionData()',()=>{
                const validTransactionDataMock=jest.fn();
                blockchain.validTransactionData=validTransactionDataMock;

                newChain.addBlock({data:'foo'});
                blockchain.replaceChain(newChain.chain,true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        })
    });

    describe('validTransactionData()',()=>{
        let transaction, rewardTransaction, wallet;

        beforeEach(()=>{
            wallet= new Wallet();
            transaction= wallet.createTransaction({
                recipient: 'foo-address',
                amount:65
            })

            rewardTransaction= Transaction.rewardTransaction({minerWallet: wallet});
        });

        describe('transaction data is valid',()=>{
            
            it('returns true',()=>{
                newChain.addBlock({data:[transaction, rewardTransaction]});

                expect(blockchain.validTransactionData({
                    chain: newChain.chain,
                })).toBe(true);

                expect(errorMock).not.toHaveBeenCalled();
                
            });
        });

        describe('transaction data has multiple rewards',()=>{
            it('returns false and logs error',()=>{
                newChain.addBlock({data:[transaction,rewardTransaction,rewardTransaction]});
                
                expect(blockchain.validTransactionData({
                    chain: newChain.chain,
                })).toBe(false);

                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('transaction data has atleast malformed outputMap',()=>{
            
            describe('transaction is not a reward transaction',()=>{
                it('returns false and logs error',()=>{
                    
                    transaction.outputMap[wallet.publicKey]= 999999;
                    newChain.addBlock({data:[transaction,rewardTransaction]});

                    expect(blockchain.validTransactionData({
                        chain: newChain.chain,
                    })).toBe(false);

                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('transaction is reward transaction',()=>{
                it('returns false and logs error',()=>{
                    rewardTransaction.outputMap[wallet.publicKey]=99999;
                    newChain.addBlock({data:[transaction,rewardTransaction]});

                    expect(blockchain.validTransactionData({
                        chain: newChain.chain,
                    })).toBe(false);

                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe('transaction data has malformed input',()=>{
            it('returns false and logs error',()=>{
                wallet.balance=9000;
                const evilOutputMap={
                    [wallet.publicKey]: 8900,
                    fooRecipient: 100
                };

                const evilTransaction={
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap:evilOutputMap
                }

                newChain.addBlock({data: [evilTransaction, rewardTransaction]});

                expect(blockchain.validTransactionData({
                    chain: newChain.chain,
                })).toBe(false);

                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('transaction data does repeat in the block',()=>{

            it('returns false and logs error',()=>{
                newChain.addBlock({data: [transaction,transaction,transaction,rewardTransaction]});

                expect(blockchain.validTransactionData({
                    chain: newChain.chain,
                })).toBe(false);

                expect(errorMock).toHaveBeenCalled();

            });

        });
    });
});
