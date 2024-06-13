//handle GET request for /home, load film data
var express = require('express');
const { getConnection } = require('../database');
const router = express.Router();
const mysql = require('mysql');
var bcrypt = require('bcrypt');
var crypto = require('crypto');


// Function to hash email
function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}

// POST request - user wants to login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const hashedEmail = hashEmail(email);

    getConnection(async (err, connection) => {
        if (err) throw err;
        const sqlSearch = "SELECT * FROM user_login WHERE email = ?";
        const search_query = mysql.format(sqlSearch, [hashedEmail]);

        connection.query(search_query, async (err, result) => {
            if (err) throw err;

            if (result.length == 0) {
                connection.release();
                return res.status(404).json({ message: 'User not found' });
            } else {
                const dbPassword = result[0].password;
                bcrypt.compare(password, dbPassword, async (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        const user_id = result[0].user_id;
                        connection.release();
                        res.cookie('sessionEmail', email, { httpOnly: true, secure: true });
                        res.cookie('sessionID', user_id, { httpOnly: true, secure: true });

                        return res.status(200).json({ message: 'Login successful', userId: user_id });
                    } else {
                        connection.release();
                        return res.status(401).json({ message: 'Credentials incorrect' });
                    }
                });
            }
        });
    });
});



//post request - user wants to create again
router.post('/createAccount', async (req, res) => {

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



//user logs out
router.post('/signout', function (req, res) {
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


// Get products endpoint
router.get('/get_products', async (req, res) => {
    getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).send('Database connection failed');
        }

        const query = 'SELECT name, description, price, image_1, image_2, image_3 FROM products';
        connection.query(query, (error, results) => {
            connection.release();

            if (error) {
                console.error('Database query failed:', error);
                return res.status(500).send('Database query failed');
            }

            res.status(200).json(results);
        });
    });
});


module.exports = router;
