//handle POST and GET request for /createAccount
var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var { getConnection } = require('../database');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

// Function to hash email
async function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}

//post request - user wants to create again
router.post('/', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        //empty fields
        res.render('index', { title: 'Express', session: { email: null, id: null, createAccount: true } });
    }

    const hashedEmail = await hashEmail(email);
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    getConnection(async (err, connection) => {

        if (err) throw (err)
        const sqlSearch = "SELECT * FROM user_login WHERE email = ?"
        const search_query = mysql.format(sqlSearch, [hashedEmail])
        const sqlInsert = "INSERT INTO user_login (user_id, email, password) VALUES (0,?,?)"
        const insert_query = mysql.format(sqlInsert, [hashedEmail, hashPassword])

        await connection.query(search_query, async (err, result) => {

            if (err) throw (err)

            if (result.length != 0) {
                //user already exists: error
                connection.release();
                console.log("------> User already exists");
                return res.render('index', { title: 'Express', session: { session: req.session, message: 'User already exists', createAccount: true } });

            }
            else {
                //create new user
                await connection.query(insert_query, async (err, result) => {
                
                    if (err) throw (err)

                    let user_id = result.insertId //user_id always matches insert id
                    res.cookie('sessionID', user_id);
                    res.cookie('sessionEmail', email); // Store email in a cookie
                    console.log("--------> Created new User");

                    connection.release()

                    return res.redirect('/');
                });                
            }
        });
    });
    //end of getConnection
});
//end of post request



module.exports = router;
