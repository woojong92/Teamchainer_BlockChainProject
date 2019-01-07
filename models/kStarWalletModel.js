const contractName = 'KStarWallet';
const { GAS_LIMIT_MULTIPLE } = require('../helpers/constants');
const fs = require('fs');
const path = require('path');
const web3 = require('../helpers/web3Initializer');


class KStarWalletModel {

  constructor() {
    this.web3 = web3;
  }

  getAccounts() {
    return this.web3.eth.getAccounts();
  }

  getContractInstance(abi, address) {
    return new web3.eth.Contract(
        JSON.parse(abi),
        address
    );
  }

  balanceOf(address, coinAddress) {
    const coinABI = this.getABI("KStarCoin");
    const coinContract = this.getContractInstance(coinABI.interface, coinAddress);
    console.log(coinABI.interface);
    console.log(address);
    return coinContract.methods.balanceOf(address).call();
  }

  transfer(params, eoa) {
    const coinABI = this.getABI("KStarCoin"); // 향후에는 범용적인 ERC20으로 만들어야 함.
    const walletABI = this.getABI("KStarWallet");
    const coinContract = this.getContractInstance(coinABI.interface, params.coinAddress);
    const fromKStarWallet = this.getContractInstance(walletABI.interface, params.fromKStarWallet);
    const toKStarWallet = this.getContractInstance(walletABI.interface, params.toKStarWallet);

    const byteData = coinContract.methods.transfer(
        toKStarWallet.options.address,
        params.tokenAmount
    ).encodeABI();

    const byteDataLength = byteData.length;

    console.log("byteData > " ,byteData);
    console.log("byteDataLength > " ,byteDataLength);

    const result = fromKStarWallet.methods
                .external_call(
                    coinContract.options.address,
                    0,
                    byteDataLength,
                    byteData
                )
                .send({
                    from : eoa,
                    gas : 900000
                });

    return result;
  }

  approve(params, eoa) {
    const coinABI = this.getABI("KStarCoin"); // 향후에는 범용적인 ERC20으로 만들어야 함.
    const walletABI = this.getABI("KStarWallet");
    const coinContract = this.getContractInstance(coinABI.interface, params.coinAddress);
    const fromKStarWallet = this.getContractInstance(walletABI.interface, params.fromKStarWallet);
    const toKStarWallet = this.getContractInstance(walletABI.interface, params.toKStarWallet);

    const byteData = coinContract.methods.approve(
        toKStarWallet.options.address,
        params.tokenAmount
    ).encodeABI();

    const byteDataLength = byteData.length;


    console.log("byteData > " ,byteData);
    console.log("byteDataLength > " ,byteDataLength);


    const result = fromKStarWallet.methods
                .external_call(
                    coinContract.options.address,
                    0,
                    byteDataLength,
                    byteData
                )
                .send({
                    from : eoa,
                    gas : 900000
                });

    return result;
  }

  transferFrom(params, eoa) {
    const coinABI = this.getABI("KStarCoin"); // 향후에는 범용적인 ERC20으로 만들어야 함.
    const walletABI = this.getABI("KStarWallet");
    const coinContract = this.getContractInstance(coinABI.interface, params.coinAddress);
    const fromKStarWallet = this.getContractInstance(walletABI.interface, params.fromKStarWallet);
    const spenderKStarWallet = this.getContractInstance(walletABI.interface, params.spenderKStarWallet);
    const toKStarWallet = this.getContractInstance(walletABI.interface, params.toKStarWallet);

    const byteData = coinContract.methods.transferFrom(
        fromKStarWallet.options.address,
        toKStarWallet.options.address,
        params.tokenAmount
    ).encodeABI();

    const byteDataLength = byteData.length;


    console.log("byteData > " ,byteData);
    console.log("byteDataLength > " ,byteDataLength);


    const result = spenderKStarWallet.methods
                .external_call(
                    coinContract.options.address,
                    0,
                    byteDataLength,
                    byteData
                )
                .send({
                    from : eoa,
                    gas : 900000
                });

    return result;
  }

  changeUserOwnership(params, eoa) {
    const walletABI = this.getABI("KStarWallet");
    const myKStarWallet = this.getContractInstance(walletABI.interface, params.myKStarWallet);
    const gas = myKStarWallet.methods.renounceUserOwnership(params.myKStarWallet).estimateGas();
    const result = myKStarWallet.methods
                                .renounceUserOwnership(params.myKStarWallet)
                                .send({
                                    from : eoa,
                                    gas : gas * GAS_LIMIT_MULTIPLE
                                });

    return result;

  }


  getABI(contractName) {
    const inputFilePath = path.resolve('build', `${contractName}.json`);
    const jsonData = fs.readFileSync(inputFilePath, 'utf8');
    const jsonObj = JSON.parse(jsonData);

    return jsonObj;
  }



}

module.exports = KStarWalletModel;
