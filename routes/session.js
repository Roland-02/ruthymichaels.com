// login and signup broken

const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var { getConnection } = require('../database');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');


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

// Function to send email
const sendVerificationEmail = (userEmail) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.myEmail,
            pass: process.env.myEmailPassword,
        },
    });
    const token = jwt.sign({ email: userEmail }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationUrl = `http://localhost:8080/verify_email?token=${token}`;

    const mailOptions = {
        from: process.env.myEmail,
        to: userEmail,
        subject: 'Email Verification',
        html: `<p>
        Please verify your email by clicking on the link below:</p>
        <p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p>
        This link will expire in 1 hour</p>
        <p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
};

router.get('/check_verification', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database connection error' });
        }

        const sqlSearch = 'SELECT verified FROM user_login WHERE email = ?';
        connection.query(sqlSearch, [email], (err, result) => {
            connection.release();

            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Database query error' });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isVerified = result[0].verified;

            if (isVerified) {
                return res.status(200).json({ message: 'Verified', verified: true });
            } else {
                return res.status(200).json({ message: 'Unverified', verified: false });
            }
        });
    });
});

router.get('/verify_email', (req, res) => {
    const { token } = req.query;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.email;

        // Get a connection from the pool
        getConnection((err, connection) => {
            if (err) throw err;

            const update_query = 'UPDATE user_login SET verified = 1 WHERE email = ?';
            connection.query(update_query, [userEmail], (err, result) => {
                connection.release();  // Always release the connection back to the pool

                if (err) throw err;

                if (result.affectedRows > 0) {
                    const sessionData = { id: result.insertId, email: userEmail };

                    req.cookies.sessionEmail = userEmail;
                    req.cookies.sessionID = result.insertID;

                    res.redirect('/index?verified=true');

                } else {
                    res.redirect('/index?verified=false');

                }
            });
        });

    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(400).send('Invalid or expired token.');
    }
});

router.post('/resend_verification/:email', (req, res) => {
    const { email } = req.params;

    try {
        // Get a connection from the pool
        getConnection((err, connection) => {
            if (err) throw err;

            const user_query = 'SELECT * FROM user_login WHERE email = ?';
            connection.query(user_query, [email], (err, result) => {
                if (err) throw err;

                connection.release();


                if (result.length > 0 && !result[0].verified) {
                    // Send the verification email again
                    sendVerificationEmail(email);

                    res.status(200).json({ message: 'Verification link sent. Please check your email.' });
                } else {
                    res.status(400).json({ message: 'Email is already verified or does not exist.' });
                }
                
            });
        });

    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST request - user wants to login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database connection error' });
        }

        const user_query = 'SELECT * FROM user_login WHERE email = ?';
        connection.query(user_query, [email], async (err, result) => {
            connection.release();

            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Database query error' });
            }

            if (result.length === 0) {
                return res.status(400).json({ message: 'Email or password incorrect' });
            }

            const user = result[0];

            if (!user.verified) {
                return res.status(403).json({ message: 'Please verify your account', verified: false });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Email or password incorrect' });
            }

            // Assuming you create a session or return user data here
            return res.status(200).json({ id: user.user_id, email: user.email });
        });
    });
});

// POST request - user wants to create an account
router.post('/createAccount', async (req, res) => {
    const { email, password } = req.body;
    console.log(email)

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // const hashedEmail = hashEmail(email);
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database connection error' });
        }

        const sqlSearch = "SELECT * FROM user_login WHERE email = ?";
        const search_query = mysql.format(sqlSearch, [email]);
        const sqlInsert = "INSERT INTO user_login (user_id, email, password) VALUES (0, ?, ?)";
        const insert_query = mysql.format(sqlInsert, [email, hashPassword]);

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

                    sendVerificationEmail(email);

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