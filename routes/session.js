// login and signup broken

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
        method: null,
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
                        res.cookie('sessionEmail', email, { httpOnly: true, secure: true });
                        res.cookie('sessionID', user_id, { httpOnly: true, secure: true });

                        console.log("--------> User logged in");
                        return res.status(200).json({ message: 'Login successful', id: user_id, email: email, method: null });

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
                    res.cookie('sessionEmail', email, { httpOnly: true, secure: true });
                    res.cookie('sessionID', user_id, { httpOnly: true, secure: true });

                    connection.release();
                    console.log("--------> Created new User");
                    return res.status(200).json({ message: 'New account created', id: user_id, email: email, method: null });
                });
            }

        });
    });
});

// POST route to update user email
router.post('/change_email/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from request parameters
        const { newEmail } = req.body; // Get newEmail from request body

        // Validate input
        if (!userId || !newEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Hash the new email
        const hashedEmail = hashEmail(newEmail);

        // Update email in user_login table
        getConnection(async (err, connection) => {
            if (err) throw err;

            const query = `UPDATE user_login SET email = ? WHERE user_id = ?`;

            connection.query(query, [hashedEmail, userId], (error, results) => {
                connection.release(); // Release connection before checking for errors

                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Database update failed' });
                }

                // Update session email
                res.cookie('sessionEmail', newEmail, { httpOnly: true, secure: true });

                res.status(200).json({ message: 'Email updated successfully' });
            });
        });

    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST route to update user email
router.post('/change_password/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { newPassword } = req.body;

        // Validate input
        if (!userId || !newPassword) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Hash the new email
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        // Update email in user_login table
        getConnection(async (err, connection) => {
            if (err) throw err;

            const query = `UPDATE user_login SET password = ? WHERE user_id = ?`;

            connection.query(query, [hashPassword, userId], (error, results) => {
                connection.release(); // Release connection before checking for errors

                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Database update failed' });
                }

                res.status(200).json({ message: 'Password updated successfully' });
            });
        });

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
        console.log("Redirecting to home page...");

       // Redirect to home or login page
        res.redirect('/');
    });
 

});


module.exports = router;