//Express 기본 모듈 불러오기
var express = require('express');
var http = require('http');
var path = require('path');

//express 미들웨어 불러오기
var bodyParser = require('body-parser');
var static = require('serve-static');
var cookieParser = require('cookie-parser');
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

//web3 모듈 불러들이기

//var Web3 = require('web3');
// use the given Provider, e.g in Mist, or instantiate a new websocket provider

//const web3 = require('./helpers/web3Initializer');


//유저 관련 모듈 불러들이기
var user = require('./routes/user');



/****************************************************************************************/
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
    UserModel = mongoose.model("users5", UserSchema);
    console.log("UserModel 정의 함.");

    //init 호출
    user.init(database, UserSchema, UserModel);
}
/****************************************************************************************/




//기본 속성 설정
app.set('port', process.env.PORT || 3000);

//body-parser 설정
app.use(bodyParser.urlencoded({extend: false}));
app.use(bodyParser.json());

app.use(static(path.join(__dirname, 'public')));

app.use(expressSession({
    secret:'my key',
    resave:true, //resave: 요청이 바뀌지 않았어도 세션 정보를 강제로 다시 저장한다.
    saveUninitialized:true
}));

//라우터 객체를 app 객체에 등록
app.use('/', router);

//res.locals.patials 객체에 주입할 미들웨어
/*
app.use(function(req, res, next){
    
    if(!res.locals.partials) res.locals.partials={};
    res.locals.partials.weatherContext = getWeatherData();
    next();
});
*/

// res.locals is an object passed to hbs engine
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

/****************************************************************************************/
//view engin
var handlebars = require('express-handlebars').create({ 
    defaultLayout:'main',
    helpers: { //섹션
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
/****************************************************************************************/


router.route('/process/login').post(user.login);
router.route('/process/adduser').post(user.adduser);
router.route('/process/listuser').post(user.listuser);
router.route('/process/logout').get(user.logout);


/*
router.route('process/product').get(function(req, res){
    console.log('/process/product 호출됨.');

    if(req.session.user){
        res.redirect('/public/product.html');
    }else{
        res.redirect('public/login.html');
    }
})
*/

app.get('/', function(req, res){
    res.render('home');
});

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/signup', function(req, res) {
    res.render('signup');
})

app.get('/mypage', function(req, res) {
    res.render('mypage');
})

app.get('/listuser', function(req, res) {
    res.render('listuser');
})

app.get(['/auction/:id?'], function(req, res){
    var id = req.params.id;
    res.render('auction', {auctionAddr: id});
})
  
app.get('/createAuction/:id?', function(req, res){
    res.render('crateAuction');
})

/*
app.get('/login', function(req, res){
    res.render('login');
})*/



/****************************************************************************************/
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

/****************************************************************************************/


/****************************************************************************************/
app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' +
        app.get('port')+'; press Ctrl-C to terminate.')

    //데이터베이스 연결
    connectDB();
});
/****************************************************************************************/

/*
function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)'
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'partly Cloudy',
                temp: '55.0 F (12.8 C)'
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)'
            }
        ]
    };
}
*/

