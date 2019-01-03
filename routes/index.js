const bodyParser = require('body-parser');
const GPATokenRouter = require('./GPATokenRouter');
const GPAWalletRouter = require('./GPAWalletRouter');
const commonRouter = require('./commonRouter');

const router = (app) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use('/api/gpatoken', GAPTokenRouter);
  app.use('/api/wallet', GAPWalletRouter);
  app.use('/api/common', commonRouter);
}

module.exports = router;