require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const ContractBuilder = require('../helpers/contractBuilder');
const _ = require('lodash');

/**
 * @description compile 수행 > build 폴더안에 json 파일 생성.
 */
(async () => {
    
    if(process.argv[2] === undefined) throw('배포할 컨트랙트 명을 입력하세요. 확장자 제외...');

    const buildPath = path.resolve(__dirname, '../build');

    const contractName = process.argv[2];
    const arguments = process.argv[3] ? process.argv[3].split(',') : [];
    console.log(arguments);
    const address = await ContractBuilder.deploy(contractName, arguments);
    
    fs.appendFileSync(
        path.resolve(buildPath, 'DeployedHistory'),
        JSON.stringify({contractName : contractName, args : arguments, contractAddr : address, createDt : new Date().toString()}) +'\n'
    );

})();