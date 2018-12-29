//require( ) 메소드는 export가 아닌 module.exports로 설정된 속성을 반환함
var user = require('./user5');

function showUser() {
    return user.getUser().name + ', ' + user.group.name;
}

console.log('사용자 정보 : %s', showUser());