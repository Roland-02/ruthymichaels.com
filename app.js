require("dotenv").config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const cors = require('cors')

// load SSL certificate and key
const sslOptions = {
    key: fs.readFileSync(path.resolve(__dirname, 'keys/private.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'keys/certificate.cer'))
};

//middleware to be used by application
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cookieParser());
app.use(bodyParser.json());

//for sessions
const timeout = 86400; // 1 day
app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: timeout,
        secure: true
    }
}));

// URL routes - links to separate files where specific requests are handled
var adminRoute = require('./routes/admin');
app.use('/admin', adminRoute);

var indexRoute = require('./routes/index');
app.use('/server', indexRoute);

const sessionRoute = require('./routes/session');
app.use('/', sessionRoute);

const checkoutRoute = require('./routes/checkout');
app.use('/checkout', checkoutRoute);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/uploads', express.static(path.join(__dirname, 'client/src/uploads')));

const allowedOrigins = ['https://www.ruthymichaels.com', 'https://ruthymichaels.com'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Allow non-browser requests like Postman
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true  // To allow cookies and session data
}));

// Catch-all route to serve the React app's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start https server
const server = https.createServer(sslOptions, app);
const port = process.env.PORT;
server.listen(port, () => console.log(`Web server running on port ${process.env.PORT}`));
