const Block = require("../SRC/block");
const { GENESIS_DATA } = require("../SRC/config");
const cryptoHash = require("../SRC/crypto-hash");

describe('Block',() => {
    const timestamp = 'a-date';
    const lastHash = 'foo-hash';
    const hash = 'bar-hash';
    const data = ['blockchain','data'];
    const nonce=1;
    const difficulty=1;
    const block = new Block({
        timestamp,
        lastHash,
        hash,
        data,
        nonce,
        difficulty
    });

    it('has a timestamp, lastHash, hash, and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });


    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        //console.log('genesisBlock', genesisBlock)

        it('returns a Block instance', ()=>{
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns the genesis data', ()=>{
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('minedBlock()', ()=>{
        const lastBlock = Block.genesis;
        const data = 'mined data';
        const minedBlock= Block.minedBlock({lastBlock, data});

        it('returns a Block instance',()=>{
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('set the ´lastHash´ to be  the ´hash´ of the lastBlock', ()=>{
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the data',()=> {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a ´timestamp´',()=> {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a sha 256 ´hash´ based on proper inputs',()=>{
            expect(minedBlock.hash)
            .toEqual(cryptoHash(
                minedBlock.timestamp,
                lastBlock.hash,
                data,
                minedBlock.nonce,
                minedBlock.difficulty
                ));
        });

        it('sets a ´hash´ that matches the difficulty criteria',()=>{
            expect(minedBlock.hash.substring(0,minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

    });
});

