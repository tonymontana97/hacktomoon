const express = require('express');
const app = express();
const fs = require("fs");
const port = 3000;

app.use(express.urlencoded({extended: true}))

const config = {
    //didContactAddress: 'T-0-148uHdp7kqAApYJ2S2sfSWHREfkZPtee6i'
    didContactAddress: 'T-0-1LNWxNiiFZQWvVkLTy6x2hUEhmjAM2ujuY'
};

const TopJs = require('./src');
const topjs = new TopJs();
topjs.setProvider('http://104.248.26.37:19081');


app.post('/login', async (req, res) => {
    isCorrectCredentials(config.didContactAddress, req.body.fingerHex).then(() => {
        return res.send({
            authStatus: true
        })
    }).catch(() => {
        return res.send({
            authStatus: false
        })
    });
});

app.post('/register', async (req, res) => {
    let pAccount = topjs.accounts.generate();

    const creatingPersonalResult = await createAccount(pAccount); // create personal account in blockchain

    pAccount = await getAccountInfo(pAccount); // getting nonce, transaction_hash for account

    const settingHexResult = await setFingerHex(pAccount, config.didContactAddress, req.body.fingerHex);
    console.log(req.body.fingerHex);
    console.log('Set hex finger result', settingHexResult);


    return res.send({
        account: pAccount
    })
});

app.post('/deploySmartContract', async (req, res) => {
    let pAccount = topjs.accounts.generate();
    let cAccount = topjs.accounts.generate();

    const creatingPersonalResult = await createAccount(pAccount); // create personal account in blockchain
    const creatingContractResult = await createAccount(cAccount); // create contract account in blockchain

    pAccount = await getAccountInfo(pAccount); // getting nonce, transaction_hash for account
    const deployDidContactResult = await deployDidContract(pAccount, cAccount); // deploying did contact

    return res.send({
        contract: cAccount,
        contractDeployDetails: deployDidContactResult
    });
});

async function createAccount(account) {
    return new Promise(((resolve, reject) => {
        setTimeout(async () => {
            const deployedAccount = await topjs.createAccount({
                account: account
            });
            resolve(deployedAccount);
        }, 10000)
    }))
}

async function getAccountInfo(account) {
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
    return new Promise((resolve, reject) => {
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

async function getPropertyFromContract(cAccount, name, codeHex) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const result = await topjs.getProperty({
                contractAddress: cAccount.address,
                type: 'map',
                data: [name, cAccount.address]
            });

            resolve(result);
        }, 16000)
    })
}

async function isCorrectCredentials(address, hexCode) {
    return new Promise(((resolve, reject) => {
        setTimeout(async() => {
            const result = await topjs.getProperty({
                contractAddress: address,
                type: 'map',
                data: ['mapdids', hexCode]
            });
            console.log('isCorrect result', result);
            if (result && result.data && result.data.property_value && result.data.property_value.length) {
                resolve(true);
            } else {
                reject(false);
            }
        }, 1000)
    }))
}

async function setFingerHex(pAccount, contractAddress, fingerHex) {
    return new Promise(async (resolve, reject) => {
        pAccount = await getAccountInfo(pAccount);
        setTimeout(async () => {
            const result = await topjs.callContract({
                account: pAccount,
                contractAddress: contractAddress,
                actionName: 'register_did',
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
