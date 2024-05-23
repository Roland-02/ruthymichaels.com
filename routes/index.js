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
    const session = {
        email: req.cookies.sessionEmail || null,
        id: req.cookies.sessionID || null,
        login: !(req.cookies.sessionEmail && req.cookies.sessionID)
    };
    
    res.render('index', { title: 'Express', session });
});

//create account form
router.get(['/', '/createAccount'], function (req, res) {
    res.render('index', { title: 'Express', session: { email: null, id: null, createAccount: true } });
});

//user logs out
router.post(['/', '/signout'], function (req, res) {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to destroy session');
        }
        // Clear cookies
        res.clearCookie('sessionEmail');
        res.clearCookie('sessionID');
        console.log("--------> User signed out");
        // Redirect to home or login page
        res.redirect('/');
    });
});


module.exports = router;
