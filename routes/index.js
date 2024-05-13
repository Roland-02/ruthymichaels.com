//handle GET request for /home, load film data
var express = require('express');
const router = express.Router();


//open index page, load in films
router.get(['/', '/home'], async function (req, res) {
    try {
        res.render('index', { title: 'Express', session: { email: req.cookies.sessionEmail, id: req.cookies.sessionID } });

    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//login form
router.get(['/', '/login'], function (req, res) {
    res.render('index', { title: 'Express', session: { email: null, id: null, login: true } });
});

//create account form
router.get(['/', '/createAccount'], function (req, res) {
    res.render('index', { title: 'Express', session: { email: null, id: null, createAccount: true } });
});
 
 

module.exports = router;
