const express = require('express');
const app = express();
require("dotenv").config();
const path = require('path');
const https = require('https');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;


// load SSL certificate and key
const sslOptions = {
    key: fs.readFileSync(path.resolve(__dirname, 'keys/private.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'keys/certificate.crt'))
};

//set the view engine to ejs specify the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//middleware to be used by application
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cookieParser());
app.use(passport.initialize()); 

//allow additional files to be read
app.use('/styles', express.static(path.join(__dirname, 'styles'), { type: 'application/css' }));
app.use('/bootstrap/js', express.static(path.join(__dirname, 'js'), { type: 'application/javascript' }));
app.use('/bootstrap/css', express.static(path.join(__dirname, 'css'), { type: 'application/css' }));
app.use('/scripts', express.static(path.join(__dirname, 'scripts'), { type: 'application/javascript' }));

//for sessions
const timeout = 86400; //1 day
app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: timeout,
        secure: true
    }
}));

// url routes - links to seperate files where specific requests are handled
var indexRoute = require('./routes/index');
app.use('/', indexRoute);

var loginRoute = require('./routes/login');
app.use('/login', loginRoute);

var createAccountRoute = require('./routes/createAccount');
app.use('/createAccount', createAccountRoute);

var adminRoute = require('./routes/admin');
app.use('/admin', adminRoute);

// Facebook authentication
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // Save user data or perform other operations
    return cb(null, profile);
  }
));

// Routes for Facebook authentication callbacks
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
    console.log(res)
    res.redirect('/'); //successful
});


// Start https server
const server = https.createServer(sslOptions, app);
const port = process.env.PORT;
server.listen(port, () => console.log(`Web server started, page accessible here https://localhost:${port}`));


