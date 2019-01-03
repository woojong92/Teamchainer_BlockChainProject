/**
 * Utility API Context 정의
 */
const express = require('express');
const router = express.Router();

const CommonController = require('../controllers/commonController.js');
const common = new CommonController();

router.get('/gasPrice', common.getGasPrice); // gas price 가져오기
router.get('/currency/rate', common.getCurrencyRate); // 1USD, 1JPY, 1CNY = KRW 환율 정보
router.get('/token/price/:tokenAddress', common.getTokenPrice);
router.get('/eth/krw/price', common.getEthKrwPrice)
module.exports = router;