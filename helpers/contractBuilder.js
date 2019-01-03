const path = require('path');
const fs = require('fs');
const solc = require('solc');
const web3 = require('./web3Initializer');
const { GAS_LIMIT_MULTIPLE } = require('../helpers/constants');

class ContractBuilder {

  static async compile(contractName) {
    const inputPath = path.resolve('contracts', `${contractName}.sol`);
    const outputPath = path.resolve('build', `${contractName}.json`);

    const inputData = fs.readFileSync(inputPath, 'utf8');
    const outputData = await solc.compile(inputData, 1)
      .contracts[`:${contractName}`];

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, ' '), 'utf8');
  }

  static async deploy(contractName, args) {
    const contractPath = path.resolve('build', `${contractName}.json`);
    const contractData = fs.readFileSync(contractPath, 'utf8');
    const contractObj = JSON.parse(contractData);
    const accounts = await web3.eth.getAccounts();
    const gas = await web3.eth.estimateGas({
        data : '0x' + contractObj.bytecode
    });

    console.log('Deploy Gas (*10% Add on) : ' + parseInt(gas * GAS_LIMIT_MULTIPLE));
  
    const result = await new web3.eth
      .Contract(JSON.parse(contractObj.interface))
      .deploy({
        data: '0x' + contractObj.bytecode,
        arguments: args
      })
      .send({ from: accounts[0], gas : parseInt(gas * GAS_LIMIT_MULTIPLE) });
  
    console.log('Contract Address : ', result.options.address);
    return result.options.address;
  }

}

module.exports = ContractBuilder;
