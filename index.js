const express = require('express');
const app = express();
const fs = require("fs");
const port = 3000;

app.use(express.urlencoded({ extended: true }))

const TopJs = require('./src');
const topjs = new TopJs();
topjs.setProvider('http://104.248.26.37:19081');

const config = {
    didContractAddress: 'T-0-1LNWxNiiFZQWvVkLTy6x2hUEhmjAM2ujuY',
};

app.post('/login', async (req, res) => {
    setTimeout(async ()=> {
        const accountInfoResult = await topjs.getProperty({
            contractAddress: req.body.contractAddress,
            type: 'map',
            data: ['mapdids', req.body.fingerHex]
        });
        console.log('getProperty Result >>> ', JSON.stringify(accountInfoResult));

        const result = await topjs.getProperty({
            contractAddress: req.body.contractAddress,
            type: 'map',
            data: ['mapproperties', req.body.personAddress]
        });
        console.log('getProperty Result >>> ', JSON.stringify(result));
    }, 3000)

    res.send('ok');
});

app.post('/register', async (req, res) => {
    const url = await topjs.getDefaultServerUrl('http://hacker.topnetwork.org/');
    let pAccount = topjs.accounts.generate();
    let cAccount = topjs.accounts.generate();

    const creatingPersonalResult = await createAccount(pAccount); // create personal account in blockchain
    const creatingContractResult = await createAccount(cAccount); // create contract account in blockchain

    pAccount = await getAccountInfo(pAccount); // getting nonce, transaction_hash for account
    const deployDidContactResult = await deployDidContract(pAccount, cAccount); // deploying did contact

    const settingHexResult = await setFingerHex(pAccount, cAccount, req.body.fingerHex);
    console.log(settingHexResult);

    const getFingerHexProperty = await getPropertyFromContract(cAccount, 'fingerHex');
    console.log(getFingerHexProperty);

    return res.send({
        account: pAccount,
        contact: cAccount
    })
});

async function createAccount(account) {
    return await topjs.createAccount({
        account: account
    });
}

async function getAccountInfo(account){
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const accountInfo = await topjs.accountInfo({
                account
            });

            if (accountInfo.data) {
                account.nonce = accountInfo.data.nonce;
                account.last_hash_xxhash64 = accountInfo.data.last_hash_xxhash64;
            }

            resolve(account);
        }, 3000)
    })
}

async function deployDidContract(pAccount, cAccount) {
    return new Promise( (resolve, reject) => {
        setTimeout(async () => {
            const data = fs.readFileSync('./contracts/did.lua');
            const publishContractResult = await topjs.publishContract({
                account: pAccount,
                contractAccount: cAccount,
                contractCode: data.toString(),
                deposit: 200
            });

            if (publishContractResult) {
                resolve(publishContractResult);
            }
        }, 6000);
    })
}

async function getPropertyFromContract(cAccount, name) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const result = await topjs.getProperty({
                contractAddress: cAccount.address,
                type: 'map',
                data: [name, 'key']
            });

            resolve(result);
        }, 16000)
    })
}

async function setFingerHex(pAccount, cAccount, fingerHex) {
    return new Promise(async (resolve, reject) => {
        pAccount = await getAccountInfo(pAccount);
        setTimeout(async () => {
            const result = await topjs.callContract({
                account: pAccount,
                contractAddress: cAccount.address,
                actionName: 'register_finger_hex',
                actionParam: [{
                    type: 'string',
                    value: fingerHex
                }]
            });

            if (result) {
                resolve(result);
            }
        }, 8000)
    })
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
