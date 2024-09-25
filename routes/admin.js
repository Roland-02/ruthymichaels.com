const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const { Readable } = require('stream')
const { getConnection } = require('../database');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadsDir = path.join(__dirname, '../client/src/uploads');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        res.send('Authentication successful! You can close this tab.');
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.send('Error getting tokens. Check the console for more details.');
    }
});

router.get('/verify_admin', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.redirect('/index?verified=false');
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user has the admin role
        if (!(decoded.email === process.env.myEmail && decoded.role === 'admin')) {
            return res.redirect('/index?verified=false');
        }

        res.cookie('sessionEmail', decoded.email, { httpOnly: true, secure: true });
        res.cookie('sessionID', decoded.user_id, { httpOnly: true, secure: true });
        res.cookie('sessionRole', 'admin', { httpOnly: true, secure: true });

        return res.redirect('/admin');

    } catch (error) {
        console.log(error);
        return res.redirect('/index?verified=false');
    }
});

router.post('/products/add_product', upload.array('images', 6), async (req, res) => {
    try {
        const { name, type, description, age, price } = req.body;
        const files = req.files;
        if (!name || !price || files.length === 0) {
            return res.status(400).send({ message: 'Name, price, and at least one image are required' });
        }

        const imageUrls = [];
        // Process each uploaded file
        for (const file of files) {
            const targetPath = path.join(uploadsDir, file.originalname);
            fs.writeFileSync(targetPath, file.buffer);
            imageUrls.push(`${file.originalname}`);
        }

        // Join image URLs into a single string to store in the database
        const imageUrlsString = imageUrls.join(',');
        console.log(imageUrlsString)

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'INSERT INTO products (id, name, type, description, age, price, image_URLs) VALUES (0, ?, ?, ?, ?, ?, ?)';

            // Now include imageUrlsString as the last value
            connection.query(query, [name, type, description, age, price, imageUrlsString], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error inserting product into DB:', error);
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
        const { name, type, description, age, price } = req.body;
        const files = req.files;
        const existingImages = req.body.existingImages || [];

        if (!name || !price || (files.length === 0 && existingImages.length === 0)) {
            return res.status(400).send({ message: 'Name, price and at least 1 image are required' });
        }
        console.log(existingImages)
        // Array to hold all images in their respective order
        const allImageUrls = [];

        // If there are existing images from the form, add them to the array
        if (existingImages && Array.isArray(existingImages)) {
            existingImages.forEach(imageUrl => {
                if (imageUrl) {
                    allImageUrls.push(imageUrl);  // Add existing images
                }
            });
        }

        // Process new image uploads and add their URLs to the array
        for (const file of files) {
            const targetPath = path.join(uploadsDir, file.originalname);
            fs.writeFileSync(targetPath, file.buffer);
            allImageUrls.push(`${file.originalname}`);
        }

        // Make sure there are no more than 6 images in total
        const validImageUrls = allImageUrls.slice(0, 6);
        const imageUrlsString = validImageUrls.join(',');

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'UPDATE products SET name = ?, type = ?, description = ?, age = ? , price = ?, image_URLs = ? WHERE id = ?';
            connection.query(query, [name, type, description, age, price, imageUrlsString, id], (error, results) => {
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

            // Query to get the image URLs from the product
            let getImageUrlsQuery = 'SELECT image_URLs FROM products WHERE id = ?';
            connection.query(getImageUrlsQuery, [id], async (error, results) => {
                if (error) {
                    connection.release();
                    console.error(error);
                    return res.status(500).send('Database retrieval failed');
                }

                // Get the image URLs
                const imageUrls = results[0]?.image_URLs.split(',');

                if (imageUrls && imageUrls.length > 0) {
                    // Delete each image from the local uploads directory
                    for (const imageUrl of imageUrls) {
                        const filePath = path.join(uploadsDir, imageUrl);

                        try {
                            // Check if the file exists before trying to delete it
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath); // Delete the file
                            }
                        } catch (fsError) {
                            console.error('Error deleting file:', fsError);
                        }
                    }
                }

                // Now delete the product from the database
                let deleteProductQuery = 'DELETE FROM products WHERE id = ?';
                connection.query(deleteProductQuery, [id], (deleteError, deleteResults) => {
                    connection.release();

                    if (deleteError) {
                        console.error(deleteError);
                        return res.status(500).send('Failed to delete product');
                    }

                    res.status(200).send({ message: 'Product and associated images deleted successfully' });
                });
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }
});


module.exports = router;