var crypto = require('crypto');

var Schema = { };

Schema.createSchema = function(mongoose) {

    // 스키마 정의
    var UserSchema = mongoose.Schema({
        id : { type : String, required: true, unique : true, 'default': ''},
        hashed_password : { type : String, required : true, 'default' : ''},
        salt : { type : String, required : true },
        name : { type : String, index : 'hashed', 'default': ''},
        age : { type : Number, 'default': ''},
        created_at : { type : Date, index : {unique : false}, 'default': Date.now},
        updated_at : { type : Date, index : {unique : false}, 'default': Date.now}
    });

    console.log('UserSchema 정의함');

    return UserSchema;
};

//module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;