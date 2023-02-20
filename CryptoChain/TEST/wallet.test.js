const Wallet = require('../SRC/wallet/wallet');
const {verifySignature} = require('../SRC/utilities/elliptic');


describe('Wallet',()=>{

    let wallet;

    beforeEach(()=>{
        wallet= new Wallet;
    });

    it('has a balance',()=>{
        expect(wallet).toHaveProperty('balance');
    });

    it('has a publicKey',()=>{
        expect(wallet).toHaveProperty('publicKey');
    });


    describe('signing data',() => {
        const data = 'foobar';

        it('verifies a signature',()=>{
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it('does not verifies an invalid signature',()=>{
            expect(
                verifySignature({
                    publicKey:wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });
}); 