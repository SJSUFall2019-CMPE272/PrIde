require('dotenv').config();
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var mongoose = require('./Mongo/mongoose')
var cors = require('cors')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var signup = require('./api/routes/common/signup')
var login = require('./api/routes/common/login')


app.use(cookieParser())
// saltround = 10;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))

app.use(
  session({
    secret: 'thisissparta',
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration: 60 * 60 * 1000 * 2, // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration: 5 * 60 * 1000
  })
)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
	usernameField: 'username', 
	passwordField: 'password', 
	passReqToCallback: true
}, login.loginHandler));
passport.serializeUser(login.serializeUser);
passport.deserializeUser(login.deserializeUser);

app.post('/login', passport.authenticate('local'), function(req, res) {
	res.send({status: "Success"});
});
app.use(signup)

app.listen(3001)
console.log('Server Listening on port 3001')

