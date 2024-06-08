const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const { Readable } = require('stream')
const path = require('path');
const { getConnection } = require('../database');
const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client });
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get(['/', '/admin'], async function (req, res) {
    try {
        res.render('admin', { title: 'Express', session: { email: req.cookies.sessionEmail, id: req.cookies.sessionID } });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.get(['/', '/add_product'], async function (req, res) {
    try {
        res.render('admin', { title: 'Express', session: { email: req.cookies.sessionEmail, id: req.cookies.sessionID, addProducts: true } });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        console.log('Tokens:', tokens);
        res.send('Authentication successful! You can close this tab.');
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.send('Error getting tokens. Check the console for more details.');
    }
});

// handle product upload
router.post('/add_product', upload.array('images', 3), async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const files = req.files;

        if (!name || !price || files.length === 0) {
            return res.status(400).send({ message: 'Name, price, and at least one image are required' });
        }

        const imageUrls = [];

        for (const file of files) {
            const { buffer, originalname } = file;
            const driveResponse = await drive.files.create({
                requestBody: {
                    name: originalname,
                    mimeType: file.mimetype
                },
                media: {
                    mimeType: file.mimetype,
                    body: Readable.from(buffer)
                }
            });
            // Set file permissions to public
            await drive.permissions.create({
                fileId: driveResponse.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
            imageUrls.push(`${driveResponse.data.id}`);
        }

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'INSERT INTO products (id, name, description, price, image_1, image_2, image_3) VALUES (0, ?, ?, ?, ?, ?, ?)';
            connection.query(query, [name, description, price, imageUrls[0], imageUrls[1], imageUrls[2]], (error, results) => {
                connection.release();

                if (error) {
                    console.error(error);
                    return res.status(500).send('Database insertion failed');
                }

                res.status(200).send({ message: 'Product added successfully' });
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }
});


module.exports = router;