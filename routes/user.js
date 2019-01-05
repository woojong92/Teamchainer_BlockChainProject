var database;
var UserSchema;
var UserModel;

var init = function(db, schema, model) {
    console.log('init 호출됨.');

    database = db;
    UserSchema = schema;
    UserModel = model;
}

var login = function(req, res) {
    console.log('user 모듈 안에 있는 login 호출됨');

    var paramId = req.body.id;// req.param('id');
    var paramPassword = req.body.password; //req.param('password');

    if(req.session.user){
        //이미 로그인된 상태
        console.log('이미 로그인됨');
        return res.redirect('/');
    }else{
        //세션 저장
        req.session.user = {
            id: paramId,
            name: '소녀시대',
            authorized: true
        }
        console.log(req.session.user);
    }

    if(database) {
        authUser(database, paramId, paramPassword, function(err, docs) {
            if(err) {throw err;}

            if(docs){
                console.dir(docs);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>')
                res.write('<div><p>Id: ' + paramId + '</p></div>');
                res.write('<div><p>password: '+ paramPassword+ '</p></div>');
                res.write('<a href="/">Home으로</a>');
                res.end();
            }else {
            
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 비밀번호를 다시 확인하라</p></div>');
                res.write('<a href="/">Home으로</a>');
                res.end();          
                   
            }
        });
    } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h1>데이터베이스 연결 실패</h1>');
        res.end(); 
    }
}

var logout = function(req, res) {
    console.log('/process/logout 호출됨.');

    if(req.session.user) {
        //로그인된 상태
        console.log('로그아웃 합니다.');

        req.session.destroy(function(err) {
            if(err) {throw err;}

            console.log('세션을 삭제하고 로그아웃되었습니다.');
            return res.redirect('/');
        });
    } else {
        //로그인 안된 상태
        console.log('logout error.');
        return res.redirect('/');
    }
}

var adduser = function(req, res) {
    console.log('user 모듈 안에 있는 adduser 호출됨.');

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
}

var listuser = function(req, res) {
    console.log('user 모듈 안에 있는 listuser 호출됨.');

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
}

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

module.exports.init = init;
module.exports.login = login;
module.exports.logout = logout;
module.exports.adduser = adduser;
module.exports.listuser = listuser;