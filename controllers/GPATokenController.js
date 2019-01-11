const ContractBuilder = require('../helpers/contractBuilder');
const Model = require('../models/GPATokenModel');
const { GAS_LIMIT_MULTIPLE, CONTRACTS, SUCCESS_MSG } = require('../helpers/constants');
const model = new Model();

class KStarCoinController {

  async getTotalSupply(req, res) {
    let isSuccess = false;
    let totalSupply;
    let msg = SUCCESS_MSG;

    try {
      totalSupply = await model.getTotalSupply();
      isSuccess = true;
    } catch (error) {
        console.error(error);
    } finally {
        res.json({
          success : isSuccess,
          msg : msg,
          data : {
            totalSupply : totalSupply
          }
        });
    }
  }

  async getBalanceOf(req, res) {
    const userAddress = req.params.userAddress;
    let isSuccess = false;
    let balance;
    let msg = SUCCESS_MSG;

    try {
      balance = await model.getBalanceOf(userAddress);
      isSuccess = true;
    } catch (error) {
        console.error(error);
        msg = error.reason
    } finally {
      res.json({
        success : isSuccess,
        msg : msg,
        data : {
          balance : balance
        }
      });
    }

  }

  async getAllowance(req, res) {
    const from = req.params.from;
    const to = req.params.to;
    let isSuccess = false;
    let allowance;
    let msg = SUCCESS_MSG;

    try {
      allowance = await model.getAllowance(from, to);
      isSuccess = true;
    } catch (error) {
        console.error(error);
        msg = error.reason;
    } finally {
      res.json({
        success : isSuccess,
        msg : msg,
        data : {
          allowance : allowance
        }
      });
    }

  }

  async transfer(req, res) {
    const to = req.body.to;
    const value = req.body.value;
    let isSuccess = false;
    let result;
    let msg = SUCCESS_MSG;

    try {
      const accounts = await model.getAccounts();
      const estimatedGas = await model.estimateGasTransfer(to, value, accounts[0]);
      const gasLimit = Math.floor(estimatedGas * GAS_LIMIT_MULTIPLE);
      result = await model.transfer(accounts[0], to, value, gasLimit);
      isSuccess = true;
    } catch (error) {
        console.error(error);
        msg = error.reason;
    } finally {
        res.json({
              success : isSuccess,
              msg : msg,
              data : {
                transactionHash : result.transactionHash
              }
        });
    }

  }

  async transferFrom(req, res) {
    const from = req.body.from;
    const to = req.body.to;
    const value = req.body.value;
    
    let result;
    let msg = SUCCESS_MSG;

    try {
      const accounts = await model.getAccounts();
      const estimatedGas = await model.estimateGasTransferFrom(from, to, value);
      const gasLimit = Math.floor(estimatedGas * GAS_LIMIT_MULTIPLE);
      result = await model.transferFrom(from, to, value, gasLimit);
      isSuccess = true;
    } catch (error) {
        console.error(error);
        msg = error.reason;
    } finally {
        res.json({
              success : isSuccess,
              msg : msg,
              data : {
                transactionHash : result.transactionHash
              }
        });
    }
  }
  
}

module.exports = KStarCoinController;
