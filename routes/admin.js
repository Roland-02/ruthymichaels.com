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
router.post('/products/add_product', upload.array('images', 6), async (req, res) => {
    try {
        const { name, type, description, price } = req.body;
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
        const imageUrlsString = imageUrls.join(',');


        getConnection((err, connection) => {
            if (err) throw err;

            let query = 'INSERT INTO products (id, name, type, description, price, image_URLs) VALUES (0, ?, ?, ?, ?, ?)';
            connection.query(query, [name, type, description, price, imageUrlsString], (error, results) => {
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

router.post('/products/edit_product/:id', upload.array('images', 6), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, description, price } = req.body;
        const files = req.files;
        const existingImages = req.body.existingImages || [];
        
        if (!name || !price || (files.length === 0 && existingImages.length === 0)) {
            return res.status(400).send({ message: 'Name, price and at least 1 image are required' });
        }

        // Array to hold all images in their respective order
        const allImageUrls = new Array(6).fill(null);

        // Place existing images in their original positions
        Object.entries(existingImages).forEach(([index, id]) => {
            allImageUrls[parseInt(index)] = id;
        });

        // Process and place new images in their respective positions
        let fileIndex = 0;
        for (let i = 0; i < allImageUrls.length; i++) {
            if (!allImageUrls[i] && fileIndex < files.length) {
                const file = files[fileIndex];
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
                await drive.permissions.create({
                    fileId: driveResponse.data.id,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone'
                    }
                });
                allImageUrls[i] = driveResponse.data.id;
                fileIndex++;
            }
        }

        // Filter out null values
        const validImageUrls = allImageUrls.filter(url => url && url !== 'null');
        const imageUrlsString = validImageUrls.join(',');

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'UPDATE products SET name = ?, type = ?, description = ?, price = ?, image_URLs = ? WHERE id = ?';
            connection.query(query, [name, type, description, price, imageUrlsString, id], (error, results) => {
                connection.release();

                if (error) {
                    console.error(error);
                    return res.status(500).send('Database update failed');
                }

                res.status(200).send({ message: 'Product edited successfully' });
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }
});

router.post('/products/delete_product/:id', async (req, res) => {
    try {
        const { id } = req.params;

        getConnection((err, connection) => {
            if (err) throw err;

            let getImageUrlsQuery = 'SELECT image_URLs FROM products WHERE id = ?';
            connection.query(getImageUrlsQuery, [id], async (error, results) => {
                if (error) {
                    connection.release();
                    console.error(error);
                    return res.status(500).send('Database retrieval failed');
                }

                const imageUrls = results[0].image_URLs.split(',');

                // Delete files from Google Drive
                for (const fileId of imageUrls) {
                    try {
                        await drive.files.delete({ fileId });
                    } catch (driveError) {
                        console.error('Error deleting file from Google Drive:', driveError);
                    }
                }

                // Delete the product from the database
                let deleteProductQuery = 'DELETE FROM products WHERE id = ?';
                connection.query(deleteProductQuery, [id], (deleteError, deleteResults) => {
                    connection.release();

                    if (deleteError) {
                        console.error(deleteError);
                        return res.status(500).send('Database deletion failed');
                    }

                    res.status(200).send({ message: 'Product deleted successfully' });
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }
});

// router.post('/products/delete_product/:id', async (req, res) => {
//     try {
//         const { id } = req.params;

//         getConnection((err, connection) => {
//             if (err) throw err;

//             let query = 'DELETE FROM products WHERE id = ?';
//             connection.query(query, [id], (error, results) => {
//                 connection.release();

//                 if (error) {
//                     console.error(error);
//                     return res.status(500).send('Database deletion failed');
//                 }

//                 res.status(200).send({ message: 'Product deleted successfully' });
//             });
//         });

//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('An error occurred while processing the request');
//     }
// });

module.exports = router;