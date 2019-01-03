require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');
const ContractBuilder = require('../helpers/contractBuilder');
const _ = require('lodash');

/**
 * @description compile 수행 > build 폴더안에 json 파일 생성.
 */
(async () => {
    
    const sources = await fs.readdir(__dirname);
    const buildPath = path.resolve(__dirname, '../build');
    const contractList = JSON.parse(process.env.CONTRACT_LIST);

    for( let idx in sources ) {
        if(sources[idx].indexOf('.sol') != -1 ){
            const source = fs.readFileSync(path.resolve(__dirname, sources[idx]), 'utf-8');
            const output = solc.compile(source, 1).contracts;

            fs.ensureDirSync(buildPath);

            for (let contract in output) {
                const fileName = contract.replace(':','');
                
                _.keyBy(contractList, o => {
                    if( o[fileName] !== undefined ) {
                        fs.outputJsonSync(
                            path.resolve(buildPath, fileName + '.json'),
                            output[contract]
                        );
                    }
                });
            }
        }
    } 

})();