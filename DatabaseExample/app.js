var express = require('express')
    ,http = require('http')
    ,path = require('path');

var bodyParser = require('body-parser')
    ,cookieParser = require('cookie-parser')
    ,Static = require('serve-static')
    ,errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json));

app.use('/public', static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

var router = express.Router();

//몽고디비 모듈 사용
var MongoClient = require('mongodb').MongoClient;

//데이터베이스 객체를 위한 변수 선언
var database;

//데이터베이스에 연결
function connectDB(){
    //데이터베이스 연결 정보
    var databaseUrl = 'mogodb://localhost:27017/local';

    //데이터베이스 연결
    MongoClient.connect(databaseUrl, function(err, db){
        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);

        //database 변수에 할당
        database = db;
    })
}

//로그인 라우팅 함수 - 데이터베이스의 정보와 비교
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

//라우터 객체 등록
app.use('/', router);

//======404 오류 페이지 처리 ====//
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//==== 서버시작 ====//
http.createServerr(app).listen(app.get('port'), function() {
    console.log('서버가 시작되었습니다. 포트: ' + app.get('port'));

    //데이터베이스 연결
    connectDB();
})


//사용자 인증하는 함수
var authUser = function(database, id, password, callback){
    console.log('authUser 호출됨.');

    //users 컬렉션 참조
    var users = database.collection('users');
    
    //아이디와 비밀번호를 사용해 검색
    users.find({"id": id, "password": password}).toArray(function(err, docs){
        if(err) {
            callback(err, null);
            return;
        } 

        if(docs.length > 0) {
            console.log('아이디 [%s], 비밀번호 [%s]가 일치하는 사용자 참음.', id, password);
            callback(null, docs);
        } else {
            console.log("일치하는 사용자 찾지 못함.");
            callback(null, null);
        }
    });
}


