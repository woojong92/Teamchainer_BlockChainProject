const Model = require('../models/commonModel');
const { SUCCESS_MSG } = require('../helpers/constants');

class CommonController {

    async getGasPrice(req, res) {
        let isSuccess = false;
        let msg = SUCCESS_MSG;
        let gasPriceData;

        try{
            gasPriceData = await Model.getGasPrice();
            isSuccess = true;
        } catch(error) {
            console.error(error);
            msg = error.reason;
        } finally {
            res.json({
                success : isSuccess,
                msg : msg,
                data : {
                    lowPrice : (parseFloat(gasPriceData['safeLow'] / 10) * 1000000000),
                    averagePrice : (parseFloat(gasPriceData['average'] / 10) * 1000000000),
                    fastPrice : (parseFloat(gasPriceData['fast'] / 10) * 1000000000),
                    fastestPrice : (parseFloat(gasPriceData['fastest'] / 10) * 1000000000),
                    unit : 'WEI'
                }
            });
        }
    }

    async getCurrencyRate(req, res) {
        let isSuccess = false;
        let msg = SUCCESS_MSG;
        let currencyRate;

        try{
            currencyRate = await Model.getCurrencyRate();
            isSuccess = true;
        } catch(error) {
            console.error(error);
            msg = error.reason;
        } finally {
            res.json({
                success : isSuccess,
                msg : msg,
                data : currencyRate
            });
        }
    }

    async getTokenPrice(req, res) {
        let isSuccess = false;
        let msg = SUCCESS_MSG;
        let tokenPrice;
        try{
            tokenPrice = await Model.getTokenPrice(req.params.tokenAddress);
            console.log(tokenPrice);
            isSuccess = true;
        } catch(error) {
            console.error(error);
            msg = error.reason;
        } finally {
            res.json({
                success : isSuccess,
                msg : msg,
                data : {
                    tokenAddress : tokenPrice['data'][0]['src_id'],
                    tokenToEth : tokenPrice['data'][0]['dst_qty']
                }
            });
        }
    }

    async getEthKrwPrice(req, res) {
        let isSuccess = false;
        let msg = SUCCESS_MSG;
        let ethKrwPrice;

        try{
            ethKrwPrice = await Model.getEthKrwPrice();
            isSuccess = true;
        } catch(error) {
            console.error(error);
            msg = error.reason;
        } finally {
            res.json({
                success : isSuccess,
                msg : msg,
                data : ethKrwPrice
            });
        }
    }

}

module.exports = CommonController;
