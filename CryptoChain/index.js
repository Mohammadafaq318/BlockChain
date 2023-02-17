const express = require('express');
const bodyParser = require('body-parser');
const Blockchain= require('./SRC/blockchain');


const app = express();
const blockchain = new Blockchain();


app.use(bodyParser.json());

//get http request
app.get('/api/blocks',(req,res)=>{
    res.json(blockchain.chain);
});

//post request allows requestor to submit data to api and application. Based on that, new objects can be created
app.post('/api/mine',(req,res)=>{
    const {data} = req.body;
    blockchain.addBlock({ data });

    res.redirect('/api/blocks');
});

const PORT=3000;
//listens for http requests
app.listen(PORT,()=>{
    console.log(`application has started a listening on localhost:${PORT}`);
});