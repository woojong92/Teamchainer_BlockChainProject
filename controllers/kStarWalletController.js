const ContractBuilder = require('../helpers/contractBuilder');
const { CONTRACTS, SUCCESS_MSG } = require('../helpers/constants');
const Model = require('../models/kStarWalletModel');
const model = new Model();

class KStarWalletController {

  async deploy(req, res) {
    const owners = req.body.owners;

    let isSuccess = true;
    let msg = SUCCESS_MSG;
    let contractAddress;

    try {
      contractAddress = await ContractBuilder.deploy(CONTRACTS['KSC_WALLET'].name, [owners]);
    } catch (error) {
        console.error(error);
        msg = msg.reason;
        isSuccess = false;
    } finally {
        res.json({
              success : isSuccess,
              msg : msg,
              data : {
                contractAddress : contractAddress
              }
        });
    }
  }

  async transfer(req, res) {
    const params = req.body;
    let isSuccess = true;
    let msg = SUCCESS_MSG;
    let balance, result;

    try {

      const eoa = await model.getAccounts();
      
      if(params.tokenAmount <= 0) {
        msg = "토큰의 양은 0보다 커야 합니다.";
        throw msg;
      }

      balance = await model.balanceOf(params.fromKStarWallet, params.coinAddress);
      
      if(balance < params.tokenAmount) {
        msg = "보유 토큰 수량이 부족합니다.";
        throw msg;
      }
      
      result = await model.transfer(params, eoa[0]);

    } catch (error) {
        console.error(error);
        msg = msg.reason;
        isSuccess = false;
    } finally {
        res.json({
              success : isSuccess,
              msg : msg,
              data : {
                transactionId : result.transactionHash
              }
        });
    }

  }

  async approve(req, res) {

    const params = req.body;
    let isSuccess = true;
    let msg = SUCCESS_MSG;
    let result;

    try {

      const eoa = await model.getAccounts();

      if(params.tokenAmount <= 0) {
        msg = "토큰의 양은 0보다 커야 합니다.";
        throw msg;
      }

      result = await model.approve(params, eoa[0]);

    } catch (error) {
        console.error(error);
        msg = msg.reason;
        isSuccess = false;
    } finally {
        res.json({
              success : isSuccess,
              msg : msg,
              data : {
                transactionId : result.transactionHash
              }
        });
    }

  }

  async transferFrom(req, res) {

    const params = req.body;
    let isSuccess = true;
    let msg = SUCCESS_MSG;
    let result;

    try {

      const eoa = await model.getAccounts();
      if(params.tokenAmount <= 0) {
        msg = "토큰의 양은 0보다 커야 합니다.";
        throw msg;
      }

      result = await model.transferFrom(params, eoa[0]);

    } catch (error) {
        console.error(error);
        msg = msg.reason;
        isSuccess = false;
    } finally {
        res.json({
              success : isSuccess,
              msg : msg,
              data : {
                transactionId : result.transactionHash
              }
        });
    }

  }


  async changeUserOwnership(req, res) {

    const params = req.body;
    let isSuccess = true;
    let msg = SUCCESS_MSG;
    let result;

    try {

      const eoa = await model.getAccounts();
      result = await model.changeUserOwnership(params, eoa[0]);

    } catch (error) {
        console.error(error);
        msg = msg.reason;
        isSuccess = false;
    } finally {
        res.json({
              success : isSuccess,
              msg : msg,
              data : {
                transactionId : result.transactionHash
              }
        });
    }

  }


}

module.exports = KStarWalletController;
