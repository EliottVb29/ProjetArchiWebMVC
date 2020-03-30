//call express
let express = require('express');

//app va use express
let app = express();

//appel db
let sql = require('./db.js');

//Import les routes
let router = require('./routes');

//Pour les POST requests
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Permet de use le css
app.use(express.static('public'));

app.use('/', router);

//Vérification port
let port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log("Server running on port " + port);
});

// -----------------------> cookies <-----------------------

let cookieParser = require('cookie-parser');
app.use(cookieParser());

// Add name in cookie
app.get('/cookie/add/:name?', (req, res) => {
    console.log(req.params);
    if ( typeof req.params.name !== 'undefined')
    {
        res.cookie('name', req.params.name);
        res.redirect('/cookie/show');
    }
    else 
        res.send('hello boy');
} );

// Show cookie content
app.get( '/cookie/show', (req,res) => {
    if ( typeof req.cookies.name !== 'undefined')
    {
        res.send('hello ' + req.cookies.name);
    }
    else 
        res.send('hello no cookie');
});

// Remove cookie
app.get( '/cookie/remove', (req,res) => {
    console.log(req.params);
    if ( typeof req.cookies.name !== 'undefined')
        {
            res.clearCookie('name');
            res.send('hello cookie remove');
        }
    else 
        res.send('hello no cookie');
});


// -----------------------> session <-----------------------


let session =  require('express-session');

let user = { username:'admin', password: '1234'};
let users = [];
users.push(user);

// Check login and password
let check = function(req, res, next) {
    console.log(req.session.iduser);
    if (req.session && (req.session.iduser >=0 ) )
      return next();
    else
      return res.status(401).send("Access denied !  <a href='/login_form'>Login</a>"); 
};

// Start using session
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false
    })
);

// Send register form
app.get('/register_form',(req, res) => {
    res.render('register.ejs');
} );

// Save new account
app.post('/register_save', (req, res) => {
    console.log(req.body);
    let user = { username: req.body.username, password: req.body.password };
    users.push(user);
    console.log(users);
    res.send('User created !   <a href="/calendar">Go to the website</a> ');
});

// Login and check user account, set session iduser and cookie username
app.get('/login', function (req, res) {
    i = 0;
    users.forEach(user => { 
        if(req.query.username === user.username && req.query.password === user.password ) {
            req.session.iduser = i;
            res.cookie('username',req.query.username);
            res.send("Login success!  <a href='/calendar'>Go to the website !</a> ");
        }
        i++;
    });
    if ( ! (req.session.iduser >= 0)  ) {
        res.send("Login failed ! <a href='/login_form'>Try again</a> ");
    };
  });

// Send login form
app.get('/login_form',(req, res) => {
    let username = "";
    if (req.cookies && req.cookies.username)
        username = req.cookies.username
        res.render('login_form.ejs', { 'username' : username });
});

// Redirect to home to content
app.get('/', (req, res) => {
    if (req.session.iduser >= 0) {
        res.redirect('/content');
    } else 
    res.redirect('/login_form');
});

// Logout and destroy session
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.clearCookie('username');
    res.send("Logout success! <a href='/login_form'>Login</a> ");
    });
