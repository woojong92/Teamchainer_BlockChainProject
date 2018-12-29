//module.export에는 객체를 그대로 할당
var user = {
    getUser : function() {
        return {id: 'test01', name: '소녀시대'};
    },
    group: {id : 'group01', name : '친구'}
}

module.exports = user;