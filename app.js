var express = require('express');
var app = express();

var bodyParser = require('body-parser');

//view engin
var handlebars = require('express-handlebars').create({ 
    defaultLayout:'main',
    helpers: { //세션
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');



//기본 속성 설정
app.set('port', process.env.PORT || 3000);

//body-parser 설정
app.use(bodyParser.urlencoded({extend: false}));
app.use(bodyParser.json());



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

