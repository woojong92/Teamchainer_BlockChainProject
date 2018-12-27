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


//미들웨어에서 파라미터 확인
/*
app.use(function(req, res, next){
    console.log('미들웨어 파라미터 확인.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
    res.write('<div><p>Id: ' + paramId + '</p></div>');
    res.write('<div><p>password: '+ paramPassword+ '</p></div>')
    res.end();
})
*/

//라우터 함수 등록
//router.route('/process/login').get()
router.route('/process/login').post(function(req, res){
    console.log('/process/login 처리');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    if(req.session.user){
        //이미 로그인된 상태
        console.log('이미 로그인됨');
        res.redirect('/public/product.html');
    }else{
        //세션 저장
        req.session.user = {
            id: paramId,
            name: '소녀시대',
            authorized: true
        }
    }

    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
    res.write('<div><p>Id: ' + paramId + '</p></div>');
    res.write('<div><p>password: '+ paramPassword+ '</p></div>');
    res.write('<a href="http://localhost:3000/product.html">프로덕트 페이지</a>')
    res.end();
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

//res.locals.ratials 객체에 주입할 미들웨어
app.use(function(req, res, next){
    if(!res.locals.partials) res.locals.partials={};
    res.locals.partials.weatherContext = getWeatherData();
    next();
});


app.get('/', function(req, res){
    res.render('home');
});

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/login', function(req, res){
    res.render('login');
})


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
});

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

