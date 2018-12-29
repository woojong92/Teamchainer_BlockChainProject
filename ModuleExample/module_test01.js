//require() 메소드는 exports 객체를 반환함
var user1 = require('./user1');

function showUser() {
    return user1.getUser().name + ', ' + user1.group.name;
}

console.log('사용자 정보 : %s ', showUser());