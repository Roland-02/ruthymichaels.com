const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const { Readable } = require('stream')
const { getConnection } = require('../database');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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

const transporter = nodemailer.createTransport({
    service: 'Gmail', // or another email service
    auth: {
        user: `${process.env.myEmail}`,
        pass: `${process.env.myEmailPassword}`,
    },
});

// Send an update email
const sendOrderUpdateEmail = async (customer_email, newStatus, order_id, trackingRef) => {
    let statusMessage = '';

    // Use switch to create unique messages for each status
    switch (newStatus) {
        case 'Printing':
            statusMessage = `
                <p>Your books are currently being printed by BookVault. Please keep an eye on your inbox for further notifications.</p>`
            break;

        case 'Shipped':
            statusMessage = `
                <p>Your order has now been shipped!</p>
                <p><strong>Tracking Reference:</strong> ${trackingRef}</p>
                <p>Track your package via <a href="https://www.yodel.co.uk/track" target="_blank">Yodel Tracking</a>.</p>`;
            break;

        case 'Delivered':
            statusMessage = `
                <p>Your items have been delivered. We hope you enjoy your order!</p>
                <p>Don't forget to leave a review!</p>`
            break;

        default:
            statusMessage = `
                <p>Your order status has been updated to <strong>${newStatus}</strong>.</p>
                <p>We will notify you of any further updates!</p>`
            break;
    }

    // Create the email content using the unique status message
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
                <p>Hi,</p>
                <p>Order: <strong>${order_id}</strong> has been updated<strong></p>
                ${statusMessage}
                <p>Kind regards,</p>
                <p>Ruthy Michaels</p>
            </div>
            <div class="footer">
                &copy; 2024 ruthymichaels.com. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    // Send the email
    await transporter.sendMail({
        from: process.env.myEmail,
        to: customer_email,
        subject: `Order update - ${newStatus}`,
        html: emailContent,
        attachments: [
            {
                filename: 'Ruthy_Michaels_logo.png',
                path: path.join(__dirname, '../client/src/images/Ruthy_Michaels_logo.png'),
                cid: 'businessLogo'
            }
        ]
    });
};

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
        console.log(files)
        if (!name || !price) {
            return res.status(400).send({ message: 'Name and price are required' });
        }

        const sanitizedProductName = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

        const imageUrls = [];
        // Process each uploaded file
        for (const file of files) {
            // Extract the original file name without extension
            const originalFileName = path.basename(file.originalname, path.extname(file.originalname));
            // Extract the original file extension (e.g., .jpg, .png)
            const fileExtension = path.extname(file.originalname);
        
            // Create a new unique file name by adding the product name and keeping the original file name
            const newFileName = `${sanitizedProductName}_${originalFileName}_${Date.now()}${fileExtension}`;
        
            const targetPath = path.join(uploadsDir, newFileName);
            fs.writeFileSync(targetPath, file.buffer);
            imageUrls.push(newFileName);  // Save the new file name (not including the full path)
        }

        // Join image URLs into a single string to store in the database
        const imageUrlsString = imageUrls.join(',');

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

        if (!name || !price) {
            return res.status(400).send({ message: 'Name, price, and at least 1 image are required' });
        }

        // Sanitize the product name to make it file-system friendly
        const sanitizedProductName = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

        // Array to hold all images in their respective order
        const allImageUrls = [];

        // If there are existing images, add them to the array
        if (existingImages && Array.isArray(existingImages)) {
            existingImages.forEach(imageUrl => {
                if (imageUrl) {
                    allImageUrls.push(imageUrl);  // Add existing images to the list
                }
            });
        }

        // Process new image uploads and add their URLs to the array
         for (const file of files) {
            // Extract the original file name without the extension
            const originalFileName = path.basename(file.originalname, path.extname(file.originalname));
            // Extract file extension
            const fileExtension = path.extname(file.originalname);
            // Create a new unique file name by appending the product name, original file name, and timestamp
            const newFileName = `${sanitizedProductName}_${originalFileName}_${Date.now()}${fileExtension}`;

            const targetPath = path.join(uploadsDir, newFileName);
            fs.writeFileSync(targetPath, file.buffer);  // Save the file to the uploads directory
            allImageUrls.push(newFileName);  // Add the new image URL
        }


        // Ensure there are no more than 6 images in total
        const validImageUrls = allImageUrls.slice(0, 6);
        const imageUrlsString = validImageUrls.join(',');

        getConnection((err, connection) => {
            if (err) throw err;

            // Update product details and image URLs in the database
            const query = 'UPDATE products SET name = ?, type = ?, description = ?, age = ?, price = ?, image_URLs = ? WHERE id = ?';
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

router.post('/products/delete_image/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;

        getConnection((err, connection) => {
            if (err) throw err;

            // Query to get current image URLs from the product
            let getImageUrlsQuery = 'SELECT image_URLs FROM products WHERE id = ?';
            connection.query(getImageUrlsQuery, [id], async (error, results) => {
                if (error) {
                    connection.release();
                    console.error(error);
                    return res.status(500).send('Database retrieval failed');
                }

                // Check if the product exists
                if (!results || results.length === 0) {
                    connection.release();
                    return res.status(404).send({ message: 'Product not found' });
                }

                // Check if image_URLs exists and split them
                let imageUrls = results[0]?.image_URLs ? results[0].image_URLs.split(',') : [];

                if (!imageUrls.includes(imageUrl)) {
                    connection.release();
                    return res.status(400).send({ message: 'Image URL not found in product' });
                }

                // Remove the imageUrl from the array
                imageUrls = imageUrls.filter(url => url !== imageUrl);

                // Update the product's image URLs in the database
                const updatedImageUrls = imageUrls.join(',');
                let updateImageUrlsQuery = 'UPDATE products SET image_URLs = ? WHERE id = ?';
                connection.query(updateImageUrlsQuery, [updatedImageUrls, id], (updateError) => {
                    if (updateError) {
                        connection.release();
                        console.error(updateError);
                        return res.status(500).send('Failed to update image URLs');
                    }

                    // Delete the image from the local uploads directory
                    const filePath = path.join(uploadsDir, imageUrl);

                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath); // Delete the file
                        } else {
                            console.warn(`File not found: ${filePath}`);
                        }
                    } catch (fsError) {
                        console.error('Error deleting file:', fsError);
                        return res.status(500).send('Failed to delete the image file');
                    }

                    connection.release();
                    res.status(200).send({ message: 'Image removed successfully' });
                });
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }
});


router.get('/orders_status', async (req, res) => {
    try {
        getConnection(async (err, connection) => {
            if (err) throw err;

            // Query to join orders and user_login tables
            const ordersQuery = `
                SELECT o.order_id, o.status, o.user_id, o.bookVault_ref, o.tracking_ref, ul.email AS user_email 
                FROM orders o 
                JOIN user_login ul ON o.user_id = ul.user_id
            `;

            connection.query(ordersQuery, async (error, orders) => {
                if (error) {
                    connection.release();
                    return res.status(500).send('Failed to fetch orders');
                }

                try {
                    // Send the orders with user emails back to the client
                    res.status(200).json({ orders });
                } catch (error) {
                    connection.release();
                    res.status(500).send('Failed to process order items');
                }
            });
        });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

router.post('/update_order_status', async (req, res) => {
    const { customer_email, order_id, status, bookVault_ref, tracking_ref } = req.body;

    try {
        const updateQuery = `UPDATE orders SET status = ?, bookVault_ref = ?, tracking_ref = ? WHERE order_id = ?`;

        getConnection((err, connection) => {
            if (err) throw err;

            connection.query(updateQuery, [status, bookVault_ref, tracking_ref, order_id], (error, results) => {
                connection.release();

                if (error) {
                    return res.status(500).send('Error updating order status');
                }

                sendOrderUpdateEmail(customer_email, status, order_id, tracking_ref)
                return res.status(200).send('Order status updated');
            });
        });
    } catch (error) {
        return res.status(500).send('Error processing request');
    }
});


module.exports = router;