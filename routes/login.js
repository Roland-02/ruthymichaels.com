//handle POST and GET request for /login

var express = require('express');
const router = express.Router();
const mysql = require('mysql');
var { getConnection } = require('../database');
var bcrypt = require('bcrypt');
const axios = require('axios');



//post request - user wants to login
router.post('/login', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        //empty fields
        return res.render('index', { title: 'Express', session: req.session, message: null, email: null, id: null, login: true });
    }

    getConnection(async (err, connection) => {

        if (err) throw (err)
        const sqlSearch = "SELECT * FROM user_login WHERE email = ?";
        const search_query = mysql.format(sqlSearch, [email]);

        await connection.query(search_query, async (err, result) => {

            if (err) throw (err);

            if (result.length == 0) {
                connection.release();
                console.log('--------> User not found');
                return res.render('index', { title: 'Express', session: req.session, message: 'User not found', login: true });

            } else {
                let dbPassword = result[0].password;
                bcrypt.compare(password, dbPassword, async (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        //successful login
                        let user_id = result[0].user_id
                        connection.release()
                        console.log('--------> User login')
                        res.cookie('sessionEmail', email); // Store email in a cookie
                        res.cookie('sessionID', user_id);

                        return res.redirect('/');
                    }
                    else {
                        //credentials incorrect
                        connection.release()
                        return res.render('index', { title: 'Express', session: { session: req.session,  message: 'Credentials incorrect', login: true } });

                    }

                });
            };

        });
    });
    //end of getConnection

});
//end of post request



module.exports = router;

