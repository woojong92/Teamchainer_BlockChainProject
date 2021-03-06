//Express 기본 모듈 불러오기
var express = require('express');
var http = require('http');
var path = require('path');


//express 미들웨어 불러오기
var bodyParser = require('body-parser');
var static = require('serve-static');
var expressSession = require('express-session');

//express 객체 생성
var app = express();

//라우터 객체 참조
var router = express.Router();

//몽고디비 모듈 사용
var MongoClient = require('mongodb').MongoClient;

//mongoose 모듈 불러오기
var mongoose = require('mongoose');

//데이터베이스 객체를 위한 변수 선언
var database;

//데이터베이스 스키마 객체를 위한 변수 선언
var UserSchema;

//데이터베이스 모델 객체를 위한 변수 선언
var UserModel;

//crypto 모듈 불러들이기
var crypto = require('crypto');


//데이터베이스 연결- password crypto
function connectDB() {
    //데이터베이스 연결 정보
    //mongodb://%IP정보%:%포트정보%/%데이터베이스이름%
    var databaseUrl = 'mongodb://localhost:27017/local';
    
    //데이터베이스 연결
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;

    database.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.on('open', function() {
        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);

        // user 스키마 및 모델 객체 생성
        createUserSchema();
    });

    database.on('disconnected', function(){
        console.log('연결이 끊어졌습니다. 5초 후 다시 연결합니다.');
        setInterval(connectDB, 5000);
    });
}


// user 스키마 및 모델 객체 생성 - 모듈화
function createUserSchema() {

    // 스키마 정의
    UserSchema = require('./database/user_schema').createSchema(mongoose);

    //UserModel 모델 정의
    UserModel = mongoose.model("users3", UserSchema);
    console.log("UserModel 정의 함.");
}

//기본 속성 설정
app.set('port', process.env.PORT || 3000);

//body-parser 설정
app.use(bodyParser.urlencoded({extend: false}));
app.use(bodyParser.json());

app.use(static(path.join(__dirname, 'public')));

app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

//view engin
var handlebars = require('express-handlebars').create({ 
    defaultLayout:'main',
    /*
    helpers: { //세션
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }*/
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.post('/process/login', function(req, res){
    console.log('process/login 호출됨');

    var paramId = req.body.id;// req.param('id');
    var paramPassword = req.body.password; //req.param('password');

    if(database) {
        authUser(database, paramId, paramPassword, function(err, docs) {
            if(err) {throw err;}

            if(docs){
                console.dir(docs);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>')
                res.write('<div><p>Id: ' + paramId + '</p></div>');
                res.write('<div><p>password: '+ paramPassword+ '</p></div>');
                res.write('<a href="/login.html">다시 로그인하기</a>');
                res.end();
            }else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 비밀번호를 다시 확인하라</p></div>');
                res.write('<a href="/login.html">다시 로그인하기</a>');
                res.end();                
            }
        });
    } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h1>데이터베이스 연결 실패</h1>');
        res.end(); 
    }
});


//사용자 추가 라우팅 함수 - 클라이언트에서 보내온 데이터를 이용해 데이터베이스에 추가
router.route('/process/adduser').post(function(req, res) {
    console.log('/process/adduser 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    console.log('요청 파라미터 : '+ paramId + ', ' + paramPassword + ', ' + paramName);

    //데이터베이스 객체가 초기화된 경우, addUser 함수 호추하여 사용자 추가
    if(database) {
        addUser(database, paramId, paramPassword, paramName, function(err, result){
            if(err) {throw err;}

            //결과 객체 확인하여 추가된 데이터가 있으면 성공 응답 전송
            if( result && result.insertedCount > 0 ) {
                console.dir(result);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>사용자 추가 성공</h1>')
                res.end();
            } else {// 결과 객체가 없으면 실패 응답 전송
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>사용자 추가 실패</h1>')
                res.end();
            }
        });
    } else {    //데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h1>데이터베이스 연결 실패</h1>');
        res.end();        
    }
})

//사용자 리스트 함수
router.route('/process/listuser').post(function(req, res) {
    console.log('/process/listuser 호출됨.');

    //데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
    if(database) {
        // 1. 모든 사용자 검색
        UserModel.findAll(function(err, results) {
            //오류가 발생했을 때 클라이언트로 오류 전송
            if(err) {
                console.log('사용자 리스트 조회 중 오류 발생: ' + err.stack);
 
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>사용자 리스트 조회 중 오류 발생</h1>');
                res.write('<p>'+err.stack+'</p>');
                res.end();   
                return;
            }

            if(results) {// 결과 객체가 있으면 리스트 전송
                console.dir(results);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>사용자 리스트</h1>');
                res.write('<div><ul>');

                for( var i = 0 ; i< results.length; i++) {
                    var curId = results[i]._doc.id;
                    var curName = results[i]._doc.name;
                    res.write(' <li>#'+i+' : ' + curId + ', ' +curName + '</li>');
                }

                res.write('</ul></div>');
                res.end();                   
            }else{  //결과 객체가 없으면 실패 응답 전송
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>사용자 리스트 조회 실패</h1>');
                res.end();   
            }
        });
    }   else {  // 데이터베이스 객체가 초기화되지 않았을 때 실패 응답 전송
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h1>데이터베이스 연결 실패</h1>');
        res.end();        
    }
});


router.route('/process/logout').get(function(req, res){
    console.log('/process/logout 호출됨.');

    if(req.session.user) {
        //로그인된 상태
        console.log('로그아웃 합니다.');

        req.session.destroy(function(err) {
            if(err) {throw err;}

            console.log('세션을 삭제하고 로그아웃되었습니다.');
            res.redirect('/login.html');
        });
    } else {
        //로그인 안된 상태
        console.log('아직 로그인되어 있지 않습니다.');
        res.redirect('/login.html');
    }
});


router.route('process/product').get(function(req, res){
    console.log('/process/product 호출됨.');

    if(req.session.user){
        res.redirect('/public/product.html');
    }else{
        res.redirect('public/login.html');
    }
})


//라우터 객체를 app 객체에 등록
app.use('/', router);


// 커스텀 404 페이지
app.use(function(req, res){
    res.status(404);
    res.render('404');
});

// 커스텀 500 페이지
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500')
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' +
        app.get('port')+'; press Ctrl-C to terminate.')

    //데이터베이스 연결
    connectDB();
});



//사용자 인증하는 함수: 아이디로 먼저 찾고 비밀번호를 그 다음에 비교
var authUser = function(database, id, password, callback){
    console.log('authUser 호출됨.');

    //1. 아이디를 사용해 검색
    UserModel.findById(id, function(err, results) {
        if(err) {
            callback(err, null);
            return;
        }

        console.log('아이디 [%s]로 사용자 검색 결과', id);
        console.dir(results);

        if(results.length > 0) {
            console.log('아이디와 일치하는 사용자 찾음.', id);
            //2. 비밀번호 확인
            var user =new UserModel({id : id});
            var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);

            if(authenticated) {
                console.log('비밀번호 일치함');
                callback(null, results);
            } else {
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }
            
        } else {
            console.log('일치하는 사용자를 찾지 못함.');
            callback(null, null);
        }
    });
}


//사용자를 추가하는 함수2- mongoose
var addUser = function(database, id, password, name, callback) {
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);

    //UserModel의 인스턴스 생성
    var user = new UserModel({"id": id, "password": password, "name": name});

    //save()로 저장
    user.save(function(err) {
        if(err) {
            callback(err, null);
            return;
        }

        console.log("사용자 데이터 추가함.");
        callback(null, user);
    });
};