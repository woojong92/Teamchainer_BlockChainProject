require('dotenv').config(); // for configuration

const HDWalletProvider = require('truffle-hdwallet-provider-pkey');
const Web3 = require('web3');

const provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_ADDRESS);
const web3 = new Web3(provider);

provider.engine.stop();

module.exports = web3;