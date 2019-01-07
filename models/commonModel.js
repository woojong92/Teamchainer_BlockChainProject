const $ = require('../helpers/jqueryInitializer');
const { INFO_API } = require('../helpers/constants');

class CommonModel {

  static getGasPrice() {
      return $.getJSON(INFO_API['ETH_GASPRICE']);
  }

  // 향후에는 다양한 토큰을 기반으로 가져올 수 있도록 parameter를 넘겨줘야 함
  static getTokenPrice(tokenAddress) {
      return $.getJSON(INFO_API['TOKEN_PRICE'] + '?id='+tokenAddress+'&qty=1');
  }

  static getCurrencyRate() {
      return $.getJSON(INFO_API['CURRENCY_RATE']);
  }

  static getEthKrwPrice() {
      return $.getJSON(INFO_API['ETH_KRW_PRICE']);
  }

}

module.exports = CommonModel;
