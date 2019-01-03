/*
GPAToken 관련 API
*/
const express = require('express');
const router = express.Router();

const Controller = require('../controllers/GPATokenController');
const controller = new Controller();

// compile
router.post('/compile', controller.compile);

// deploy
router.post('/new', controller.deploy);

// totalSupply
router.get('/totalSupply', controller.getTotalSupply);

// balanceOf
router.get('/balanceOf/:userAddress', controller.getBalanceOf);

// allowance
router.get('/allowance/:from/:to', controller.getAllowance);

// transfer
router.post('/transfer', controller.transfer);

// transferFrom
router.post('/transferFrom', controller.transferFrom);

// approve
// router.post('/approve', controller.approve);

router.post('/lockable', controller.lockable)

module.exports = router
