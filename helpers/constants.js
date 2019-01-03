require('dotenv').config();
// .env -> constants 로 load 하는 함수 구현

module.exports = {
    GAS_LIMIT_MULTIPLE : 1.1,
    CONTRACTS : {
        'KSC' : {
            name : 'KStarCoin',
            address : '0x61e292Fe374Ff39419A88a8572A3DcC769e053D7'
        },
        'KSC_WALLET' : {
            name : 'KStarWallet'
        }
    },
    INFO_API : {
        'TOKEN_PRICE' : 'https://api.kyber.network/sell_rate',
        'CURRENCY_RATE' : 'http://api.manana.kr/exchange/rate/KRW/USD,JPY,CNY.json',
        'ETH_GASPRICE' : 'https://ethgasstation.info/json/ethgasAPI.json',
        'ETH_KRW_PRICE' : 'https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/1?code=CRIX.UPBIT.KRW-ETH&count=1'
    },
    SUCCESS_MSG : '성공적으로 처리되었습니다.'
};