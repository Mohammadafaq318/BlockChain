const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const Blockchain= require('./SRC/blockchain/blockchain');
const PubSub=require('./SRC/App/pubsub');
const TransactionPool=require('./SRC/wallet/transaction-pool');
const Wallet = require('./SRC/wallet/wallet');
const { response } = require('express');
const TransactionMiner=require('./SRC/App/transaction-miner');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain,transactionPool,wallet});
const transactionMiner = new TransactionMiner({blockchain,transactionPool,wallet,pubsub});

const DEFAULT_PORT=3000;
const ROOT_NODE_ADDRESS=`http://localhost:${DEFAULT_PORT}`;


app.use(bodyParser.json());

//get http request
app.get('/api/blocks',(req,res)=>{
    res.json(blockchain.chain);
});

//post request allows requestor to submit data to api and application. Based on that, new objects can be created
app.post('/api/mine',(req,res)=>{
    const {data} = req.body;
    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

//post request to submit transactions
app.post('/api/transact',(req,res)=>{

    
    const {amount,recipient} = req.body;

    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});

    try {
        if(transaction)
        {
            transaction.update({senderWallet: wallet, recipient,amount});
        }
        else
        {
            transaction = wallet.createTransaction({recipient,amount});
        }
         
    }catch(error){
        return res.status(400).json({type:'error',message: error.message});
    }
    

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);

    res.json({type: 'success',transaction});
});


//post request to get the data in the transaction pool map
app.get('/api/transaction-pool-map',(req,res)=>{
    res.json(transactionPool.transactionMap);
})


app.get('/api/mine-transactions',(req,res)=>{
    
    transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
})

const syncwithRootState = () =>{
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`},(error,response,body)=>{

        if(!error && response.statusCode==200){
            const rootChain= JSON.parse(body);

            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        };
        
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const rootTransactionPoolMap = JSON.parse(body);
    
          console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
          transactionPool.setMap(rootTransactionPoolMap);
        }
      });
};

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT=='true'){
    PEER_PORT=DEFAULT_PORT + Math.ceil(Math.random()*1000);
}

const PORT=PEER_PORT || DEFAULT_PORT;
//listens for http requests
app.listen(PORT,()=>{
    console.log(`application has started a listening on localhost:${PORT}`);

    if(PORT!==DEFAULT_PORT){
        syncwithRootState();
    };
   
});