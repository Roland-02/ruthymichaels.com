//handle GET request for /home, load film data
var express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getConnection } = require('../database');
const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
// const REFRESH_TOKEN = process.env.SECRET;


//open index page, load in films
router.get(['/', '/admin'], async function (req, res) {
    try {
        res.render('admin', { title: 'Express', session: { email: req.cookies.sessionEmail, id: req.cookies.sessionID } });

    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials();

const drive = google.drive({ version: 'v3', auth: oauth2Client });
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFileToDrive = async (filePath, fileName) => {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                mimeType: 'image/jpeg',
            },
            media: {
                mimeType: 'image/jpeg',
                body: fs.createReadStream(filePath),
            },
        });
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        const result = await drive.files.get({
            fileId: response.data.id,
            fields: 'webViewLink',
        });
        return result.data.webViewLink;
    } catch (error) {
        console.error('Error uploading to Google Drive', error);
        throw error;
    }
};

const handleProductUpload = async (req, res) => {
    console.log('product upload called')

    console.log(req)
    const { name, description, price } = req.body;
    const files = req.files;

    try {
        const imageUrls = [];
        for (const file of files) {
            console.log('upload file')

            const imageUrl = await uploadFileToDrive(file.path, file.originalname);
            imageUrls.push(imageUrl);
        }

        const imageUrlsString = imageUrls.join(',');

        getConnection((err, connection) => {
            if (err) throw err;

            const sql = 'INSERT INTO products (id, name, description, price, image_urls) VALUES (0, ?, ?, ?, ?)';
            connection.query(sql, [name, description, price, imageUrlsString], (error, results) => {
                connection.release();
                if (error) throw error;
                res.send('Product added successfully');
            });

        });

    } catch (error) {
        console.error('Error handling product upload', error);
        res.status(500).send('Server Error');
    }

};


//post request - user wants to login
router.post('/add_product', upload.array('images', 3), handleProductUpload);
//end of post request



module.exports = router;
