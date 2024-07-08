const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var { getConnection } = require('../database');
var bcrypt = require('bcrypt');
var crypto = require('crypto');


// Function to hash email
function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
};

router.get('/session', (req, res) => {
    const session = {
        email: req.cookies.sessionEmail || null,
        id: req.cookies.sessionID || null,
    };
    res.json(session);
});

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
                        res.cookie('sessionEmail', hashedEmail, { httpOnly: true, secure: true });
                        res.cookie('sessionID', user_id, { httpOnly: true, secure: true });

                        console.log("--------> User logged in");
                        return res.status(200).json({ message: 'Login successful', id: user_id, email: email });

                    } else {
                        connection.release();
                        return res.status(401).json({ message: 'Credentials incorrect' });
                    }

                });
            }
        });
    });
});

// POST request - user wants to create an account
router.post('/createAccount', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const hashedEmail = hashEmail(email);
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database connection error' });
        }

        const sqlSearch = "SELECT * FROM user_login WHERE email = ?";
        const search_query = mysql.format(sqlSearch, [hashedEmail]);
        const sqlInsert = "INSERT INTO user_login (user_id, email, password) VALUES (0, ?, ?)";
        const insert_query = mysql.format(sqlInsert, [hashedEmail, hashPassword]);

        connection.query(search_query, (err, result) => {
            if (err) {
                console.error(err);
                connection.release();
                return res.status(500).json({ message: 'Database query error' });
            }

            if (result.length != 0) {
                connection.release();
                console.log("------> User already exists");
                return res.status(409).json({ message: 'User already exists' });

            } else {
                connection.query(insert_query, (err, result) => {
                    if (err) {
                        console.error(err);
                        connection.release();
                        return res.status(500).json({ message: 'Database insertion error' });
                    }

                    const user_id = result.insertId;
                    res.cookie('sessionEmail', hashedEmail, { httpOnly: true, secure: true });
                    res.cookie('sessionID', user_id, { httpOnly: true, secure: true });

                    connection.release();
                    console.log("--------> Created new User");
                    return res.status(200).json({ message: 'New account created', id: user_id, email: email });
                });
            }

        });
    });
});

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


module.exports = router;
