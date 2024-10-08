const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var { getConnection } = require('../database');
var bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.myEmail,
        pass: process.env.myEmailPassword,
    },
});

// Function to send email
const sendVerificationEmail = (userEmail) => {

    const token = jwt.sign({ email: userEmail }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationUrl = `${process.env.DOMAIN}/verify_email?token=${token}`;

    const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                background-color: #f4f4f4;
                font-family: Arial, sans-serif;
                color: #333;
            }
            .container {
                background-color: #fff;
                width: 90%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #ccc;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                font-size: 24px;
                color: #ff68b4;
                border-bottom: 1px solid #ccc;
                margin-bottom: 20px;
            }
            .header img {
                width: 150px;
                margin-bottom: 10px;
            }
            .content {
                font-size: 16px;
                line-height: 1.6;
            }
            .content p {
                margin-bottom: 10px;
            }
            .footer {
                margin-top: 30px;
                padding: 5px;
                text-align: center;
                font-size: 14px;
                color: #777;
                border-top: 1px solid #ccc;
            }
        </style>
    </head>
    <body>
        <div class="container">
             <div class="header">
                <a href="${process.env.DOMAIN}" target="_blank">
                    <img src="cid:businessLogo" alt="ruthymichaels.com">
                </a>                                            
            </div>
            <div class="content">
             <p>
        Please verify your email by clicking on the link below:</p>
        <p>
        <a href="${verificationUrl}">Verify account</a>
        </p>
        <p>
        This link will expire in 1 hour</p>
        <p>
            </div>
            <div class="footer">
                &copy; 2024 RuthyMichaels.com. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: process.env.myEmail,
        to: userEmail,
        subject: 'Email Verification',
        html: emailContent,
        attachments: [
            {
                filename: 'Ruthy_Michaels_logo.png',
                path: path.join(__dirname, '../client/src/images/Ruthy_Michaels_logo.png'),
                cid: 'businessLogo'
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
};

const sendAdminVerificationEmail = async (user) => {
    // Generate a verification token for the admin
    const token = jwt.sign(
        { email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // The link will expire in 15 minutes
    );

    const verificationUrl = `${process.env.DOMAIN}/admin/verify_admin?token=${token}`;

    const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                background-color: #f4f4f4;
                font-family: Arial, sans-serif;
                color: #333;
            }
            .container {
                background-color: #fff;
                width: 90%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #ccc;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                font-size: 24px;
                color: #ff68b4;
                border-bottom: 1px solid #ccc;
                margin-bottom: 20px;
            }
            .header img {
                width: 150px;
                margin-bottom: 10px;
            }
            .content {
                font-size: 16px;
                line-height: 1.6;
            }
            .content p {
                margin-bottom: 10px;
            }
            .footer {
                margin-top: 30px;
                padding: 5px;
                text-align: center;
                font-size: 14px;
                color: #777;
                border-top: 1px solid #ccc;
            }
        </style>
    </head>
    <body>
        <div class="container">
        <div class="header">
            <a href="${process.env.DOMAIN}" target="_blank">
                <img src="cid:businessLogo" alt="ruthymichaels.com">
            </a>                                            
        </div>
        <div class="content">
        <p>Click the link below to verify and complete your admin login:</p>
        <a href="${verificationUrl}">Verify admin account</a>
        </div>
        </div>
        <div class="footer">
            &copy; 2024 RuthyMichaels.com. All rights reserved.
        </div>
    </body>
    </html>
    `;

    // Send email
    const mailOptions = {
        from: process.env.myEmail,
        to: process.env.myEmail, // Sends to the specified admin email
        subject: 'Admin Login Verification',
        html: emailContent,
        attachments: [
            {
                filename: 'Ruthy_Michaels_logo.png',
                path: path.join(__dirname, '../client/src/images/Ruthy_Michaels_logo.png'),
                cid: 'businessLogo'
            }
        ]
    };

    await transporter.sendMail(mailOptions);
};

router.get('/session', (req, res) => {
    const session = {
        email: req.cookies.sessionEmail || null,
        id: req.cookies.sessionID || null,
        method: req.cookies.sessionMethod || null,
        role: req.cookies.sessionRole || 'user',
    };
    res.json(session);
});

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

                    res.cookie('sessionEmail', userEmail, { httpOnly: true, secure: true });
                    res.cookie('sessionID', result.insertId, { httpOnly: true, secure: true });

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
                return res.status(400).json({ message: 'User not found' });
            }

            const user = result[0];

            if (!user.verified) {
                return res.status(403).json({ message: 'Please verify your account', verified: false });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Email or password incorrect' });
            }

            if (user.role === 'admin') {
                sendAdminVerificationEmail(user);
                return res.status(405).json({ message: 'Admin verification sent to email', verified: false });
            }

            res.cookie('sessionEmail', user.email, { httpOnly: true, secure: true });
            res.cookie('sessionID', user.user_id, { httpOnly: true, secure: true });
            res.cookie('sessionRole', user.role, { httpOnly: true, secure: true });

            // Assuming you create a session or return user data here
            return res.status(200).json({ id: user.user_id, email: user.email });
        });
    });
});

// POST request - user wants to create an account
router.post('/createAccount', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

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
                    res.cookie('sessionRole', 'user', { httpOnly: true, secure: true });

                    connection.release();
                    console.log("--------> Created new User");
                    return res.status(200).json({ message: 'New account created', id: user_id, email: email, method: null });
                });
            }

        });
    });
});

router.post('/forgot_password', (req, res) => {
    const { email } = req.body;

    getConnection((err, connection) => {
        if (err) throw err;

        const query = 'SELECT user_id FROM user_login WHERE email = ?';
        connection.query(query, [email], (err, result) => {
            connection.release();
            if (err) throw err;

            if (result.length > 0) {
                const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
                const resetLink = `${process.env.DOMAIN}/change_password?token=${token}`;

                // Send email with reset link
                const mailOptions = {
                    from: process.env.myEmail,
                    to: email,
                    subject: 'Password Reset',
                    text: `Click the link below to reset your password:\n ${resetLink}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        res.json({ success: false });
                    } else {
                        res.json({ success: true });
                    }
                });
            } else {
                res.json({ success: false });
            }
        });
    });
});

// POST route to update user email
router.post('/change_password', async (req, res) => {
    const { token, password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        getConnection((err, connection) => {
            if (err) throw err;

            const updateQuery = 'UPDATE user_login SET password = ? WHERE email = ?';
            connection.query(updateQuery, [hashPassword, email], (err, result) => {
                connection.release();
                if (err) throw err;

                if (result.affectedRows > 0) {
                    res.json({ success: true });
                } else {
                    res.json({ success: false });
                }

            });
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(400).json({ success: false });
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
        res.clearCookie('sessionMethod');
        res.clearCookie('sessionRole');

        // Redirect to home or login page
        res.redirect('/');
    });


});


module.exports = router;