//handle GET request for /home, load film data
var express = require('express');
const { getConnection } = require('../database');
const mysql = require('mysql');
const router = express.Router();
const nodemailer = require('nodemailer');


// get products endpoint
router.get('/get_products', async (req, res) => {
    getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).send('Database connection failed');
        }

        const query = 'SELECT * FROM products';
        connection.query(query, (error, results) => {
            connection.release();

            if (error) {
                console.error('Database query failed:', error);
                return res.status(500).send('Database query failed');
            }

            if (results.length == 0) {
                return res.status(204).send('No products not found');
            }

            res.status(200).json(results);
        });
    });
});

// get product by ID
router.get('/get_product', async (req, res) => {
    const { id, name } = req.query;

    if (id) {
        getConnection((err, connection) => {
            if (err) {
                console.error('Database connection failed:', err);
                return res.status(500).send('Database connection failed');
            }

            const query = 'SELECT * FROM products WHERE id = ?';
            connection.query(query, [id], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Database query failed:', error);
                    return res.status(500).send('Database query failed');
                }

                if (results.length === 0) {
                    return res.status(404).send('Product not found');
                }

                res.status(200).json(results[0]);
            });
        });
    } else if (name) {
        getConnection((err, connection) => {
            if (err) {
                console.error('Database connection failed:', err);
                return res.status(500).send('Database connection failed');
            }

            const query = 'SELECT * FROM products WHERE name = ?';
            connection.query(query, [name], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Database query failed:', error);
                    return res.status(500).send('Database query failed');
                }

                if (results.length === 0) {
                    return res.status(404).send('Product not found');
                }

                res.status(200).json(results[0]);
            });
        });
    } else {
        res.status(400).send('Either id or name query parameter is required');
    }
});

// Get products by an array of IDs
router.get('/get_products_by_ids', async (req, res) => {
    const ids = req.query.ids;

    if (!ids) {
        return res.status(400).send('A list of product IDs is required');
    }

    const idArray = ids.split(',');

    if (idArray.length === 0) {
        return res.status(400).send('An array of product IDs is required');
    }

    getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).send('Database connection failed');
        }

        // Generate placeholders for the query
        const placeholders = idArray.map(() => '?').join(',');

        const query = `SELECT * FROM products WHERE id IN (${placeholders})`;
        connection.query(query, idArray, (error, results) => {
            connection.release();

            if (error) {
                console.error('Database query failed:', error);
                return res.status(500).send('Database query failed');
            }

            if (results.length === 0) {
                return res.status(404).send('No products found for the provided IDs');
            }


            res.status(200).json(results);
        });
    });
});

// search products
router.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    getConnection((err, connection) => {

        if (err) throw (err)

        const sqlQuery = `SELECT * FROM products WHERE name LIKE ? OR type LIKE ? OR description LIKE ? OR age LIKE ?`;
        const searchTerm = `%${query}%`;

        connection.query(sqlQuery, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
            if (err) {
                return res.status(500).send('Server error');
            }
            res.json(results);
        });
    });

});

// route to get products in cart for a user
router.get('/get_cart/:id', async (req, res) => {
    const { id } = req.params;

    try {
        getConnection((err, connection) => {
            if (err) throw err;

            const query = `SELECT product_id FROM user_cart WHERE user_id = ?`;

            connection.query(query, [id], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error fetching loved products:', error);
                    return res.status(500).send('Database query failed');
                }

                res.status(200).json(results);
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }

});

// route to get cart products for a user
router.get('/get_cart_products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        getConnection((err, connection) => {
            if (err) throw err;

            // First query to get the product IDs in the cart
            const cartQuery = `SELECT product_id, qty FROM user_cart WHERE user_id = ?`;

            connection.query(cartQuery, [id], (error, cartResults) => {
                if (error) {
                    connection.release();
                    console.error('Error fetching cart products:', error);
                    return res.status(500).send('Database query failed');
                }

                const productIds = cartResults.map(row => row.product_id);
                const productQtyMap = {};
                cartResults.forEach(row => {
                    productQtyMap[row.product_id] = row.qty;
                });

                if (productIds.length === 0) {
                    connection.release();
                    return res.status(200).json([]);
                }

                // Second query to get product details for the retrieved product IDs
                const productsQuery = `SELECT * FROM products WHERE id IN (?)`;

                connection.query(productsQuery, [productIds], (error, productsResults) => {
                    connection.release();

                    if (error) {
                        console.error('Error fetching product details:', error);
                        return res.status(500).send('Database query failed');
                    }

                    // Merge the productQty with productsResults
                    const finalResults = productsResults.map(product => ({
                        ...product,
                        qty: productQtyMap[product.id] || 0
                    }));

                    res.status(200).json(finalResults);
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }
});

router.post('/update_cart', async (req, res) => {
    try {
        const { user_id, product_id, qty } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).send('User ID and Product ID are required');
        }

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'INSERT INTO user_cart (user_id, product_id, qty) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE qty = VALUES(qty)';
            connection.query(query, [user_id, product_id, qty], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error inserting into user_cart:', error);
                    return res.status(500).send('Database insertion failed');
                }

                res.status(200).send({ message: 'Product saved to cart successfully' });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }

});

router.post('/remove_cart_product', async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).send('User ID and Product ID are required');
        }

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'DELETE FROM user_cart WHERE user_id = ? AND product_id = ?';
            connection.query(query, [user_id, product_id], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error deleting cart product', error);
                    return res.status(500).send('Database deletion failed');
                }

                res.status(200).send({ message: 'Product deleted successfully' });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }

});

router.post('/delete_cart', async (req, res) => {
    try {
        console.log('called')
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).send('User ID is required');
        }

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'DELETE FROM user_cart WHERE user_id = ?';
            connection.query(query, [user_id], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error deleting cart', error);
                    return res.status(500).send('Database deletion failed');
                }

                res.status(200).send({ message: 'Product deleted successfully' });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }

});

// route to get loved products for a user
router.get('/get_wishlist/:id', async (req, res) => {
    const { id } = req.params;

    try {
        getConnection((err, connection) => {
            if (err) throw err;

            const query = `SELECT product_id FROM user_wishlist WHERE user_id = ?`;

            connection.query(query, [id], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error fetching loved products:', error);
                    return res.status(500).send('Database query failed');
                }

                res.status(200).json(results);
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }

});

// route to get wishlist products for a user
router.get('/get_wishlist_products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        getConnection((err, connection) => {
            if (err) throw err;

            // First query to get the product IDs in the wishlist
            const wishlistQuery = `SELECT product_id FROM user_wishlist WHERE user_id = ?`;

            connection.query(wishlistQuery, [id], (error, wishlistResults) => {
                if (error) {
                    connection.release();
                    console.error('Error fetching wishlist products:', error);
                    return res.status(500).send('Database query failed');
                }

                const productIds = wishlistResults.map(row => row.product_id);
                if (productIds.length === 0) {
                    connection.release();
                    return res.status(200).json([]);
                }

                // Second query to get product details for the retrieved product IDs
                const productsQuery = `SELECT * FROM products WHERE id IN (?)`;

                connection.query(productsQuery, [productIds], (error, productsResults) => {
                    connection.release();

                    if (error) {
                        console.error('Error fetching product details:', error);
                        return res.status(500).send('Database query failed');
                    }

                    res.status(200).json(productsResults);
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }
});

router.post('/add_wishlist', async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).send('User ID and Product ID are required');
        }

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'INSERT INTO user_wishlist (user_id, product_id) VALUES (?, ?)';
            connection.query(query, [user_id, product_id], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error inserting into user_wishlist:', error);
                    return res.status(500).send('Database insertion failed');
                }

                res.status(200).send({ message: 'Product loved successfully' });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }

});

router.post('/remove_wishlist', async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).send('User ID and Product ID are required');
        }

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'DELETE FROM user_wishlist WHERE user_id = ? AND product_id = ?';
            connection.query(query, [user_id, product_id], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error deleting loved product', error);
                    return res.status(500).send('Database deletion failed');
                }

                res.status(200).send({ message: 'Product deleted successfully' });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }

});

// get order history for a user
router.get('/order_history/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        getConnection(async (err, connection) => {
            if (err) throw err;

            const ordersQuery = `SELECT order_id, date, total_cost, currency 
                                 FROM orders 
                                 WHERE user_id = ? 
                                 ORDER BY date DESC`;

            connection.query(ordersQuery, [user_id], async (error, orders) => {
                if (error) {
                    connection.release();
                    console.error('Error fetching orders:', error);
                    return res.status(500).send('Failed to fetch orders');
                }

                // Fetch order items for each order
                const orderItemsPromises = orders.map(order => {
                    return new Promise((resolve, reject) => {
                        const itemsQuery = `SELECT oi.product_id, p.name as item, oi.qty as quantity
                                            FROM order_items oi
                                            JOIN products p ON oi.product_id = p.id
                                            WHERE oi.order_id = ?`;

                        connection.query(itemsQuery, [order.order_id], (err, items) => {
                            if (err) {
                                console.error('Error fetching order items:', err);
                                return reject(err);
                            }

                            resolve({
                                ...order,
                                items: items // Add the items to the order object
                            });
                        });
                    });
                });

                try {
                    const ordersWithItems = await Promise.all(orderItemsPromises);
                    connection.release();

                    res.status(200).json(ordersWithItems);

                } catch (error) {
                    connection.release();
                    console.error('Error processing order items:', error);
                    res.status(500).send('Failed to process order items');
                }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing the request');
    }
});

router.post('/add_review', async (req, res) => {
    const { order_id, product_id, user_id, rating, review } = req.body;

    if (!product_id || !rating || !review) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    getConnection(async (err, connection) => {
        if (err) throw err;

        // Check if the review already exists
        const checkQuery = `SELECT review_id FROM product_reviews WHERE product_id = ? AND user_id = ?`;
        const checkQueryFormatted = mysql.format(checkQuery, [product_id, user_id]);

        connection.query(checkQueryFormatted, async (err, result) => {
            if (err) {
                console.error('Error checking for existing review:', err);
                connection.release();
                return res.status(500).send({ message: 'Failed to check for existing review' });
            }

            let insert_query;
            let queryFormatted;
            if (result.length > 0) {
                // Review exists, so update it
                insert_query = `UPDATE product_reviews SET rating = ?, review = ? WHERE product_id = ? AND user_id = ?`;
                queryFormatted = mysql.format(insert_query, [rating, review, product_id, user_id]);

            } else {
                // No review exists, so insert a new one
                insert_query = `INSERT INTO product_reviews (review_id, product_id, user_id, rating, review) VALUES (0, ?, ?, ?, ?)`;
                queryFormatted = mysql.format(insert_query, [product_id, user_id, rating, review]);
            }

            connection.query(queryFormatted, async (err, result) => {
                connection.release();

                if (err) {
                    console.error('Error saving review:', err);
                    return res.status(500).send({ message: 'Failed to save review' });
                }

                res.status(201).send({ message: 'Product review saved successfully' });
            });

        });
    });
});

// Fetch reviews for a products
router.get('/fetch_product_reviews/:product_id', async (req, res) => {
    const { product_id } = req.params;

    getConnection(async (err, connection) => {
        if (err) throw err;

        const query = `
        SELECT 
            pr.product_id, 
            pr.rating, 
            pr.review, 
            p.name AS product_name,
            u.user_id,
            u.email AS user_email
        FROM 
            product_reviews pr
        INNER JOIN 
            products p ON pr.product_id = p.id
        INNER JOIN
            user_login u ON pr.user_id = u.user_id
        WHERE 
            pr.product_id = ?;`;

        const fetch_query = mysql.format(query, [product_id]);

        connection.query(fetch_query, (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing query:', err);
                return res.status(500);
            }

            if (!result || result.length === 0) {
                return res.status(204);
            }

            // Transform the result into a plain array
            const reviews = result.map(row => ({
                user_email: row.user_email,
                product_id: row.product_id,
                rating: row.rating,
                review: row.review,
                product_name: row.product_name
            }));

            res.status(200).json({ reviews });

        });
    });
});

// Fetch reviews for a user's orders
router.get('/fetch_user_reviews/:user_id', async (req, res) => {
    const { user_id } = req.params;

    getConnection(async (err, connection) => {
        if (err) throw err;

        const query = `SELECT pr.product_id, pr.rating, pr.review, p.name AS product_name
        FROM product_reviews pr
        INNER JOIN products p ON pr.product_id = p.id
        WHERE pr.user_id = ?;`;

        const fetch_query = mysql.format(query, [user_id]);

        connection.query(fetch_query, (err, result) => {
            connection.release();

            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Database query error' });
            }

            if (!result || result.length === 0) {
                return res.status(204).json({ message: 'No reviews found for this user' });
            }

            // Transform the result into a plain array
            const reviews = result.map(row => ({
                product_id: row.product_id,
                rating: row.rating,
                review: row.review,
                product_name: row.product_name,
            }));

            res.status(200).json({ reviews });
        });
    })
});

router.post('/delete_review', async (req, res) => {
    const { product_id, user_id } = req.body;

    if (!product_id || !user_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    getConnection(async (err, connection) => {
        if (err) throw err;

        const deleteQuery = `DELETE FROM product_reviews WHERE product_id = ? AND user_id = ?`;
        const deleteQueryFormatted = mysql.format(deleteQuery, [product_id, user_id]);

        connection.query(deleteQueryFormatted, async (err, result) => {
            connection.release();

            if (err) {
                console.error('Error deleting review:', err);
                return res.status(500).send({ message: 'Failed to delete review' });
            }

            if (result.affectedRows > 0) {
                res.status(200).send({ message: 'Review deleted successfully' });
            } else {
                res.status(204).send({ message: 'Review not found' });
            }

        });

    });

});

router.post('/contact', (req, res) => {
    const { email, orderRef, text } = req.body;

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.myEmail,
            pass: process.env.myEmailPassword
        }
    });

    // Email content
    const mailOptions = {
        from: email,
        to: process.env.myEmail,
        subject: `Contact Form Submission from ${email}`,
        text: `You have received a new message from the contact form.\n\nEmail: ${email}\n\nOrder Reference: ${orderRef || 'N/A'}\n\nMessage:\n${text}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ success: false, error: 'Failed to send message.' });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ success: true });
        }
    });
});

// delete account
router.post('/delete_account/:user_id', async (req, res) => {
    const { user_id } = req.params;
    console.log(user_id)
    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    getConnection(async (err, connection) => {
        if (err) throw err;

        try {
            // Start a transaction to ensure atomicity
            await connection.beginTransaction();

            // Delete user from user_login
            const deleteUserQuery = `DELETE FROM user_login WHERE user_id = ?`;

            // Delete user from user_cart
            const deleteCartQuery = `DELETE FROM user_cart WHERE user_id = ?`;

            // Delete user from user_wishlist
            const deleteWishlistQuery = `DELETE FROM user_wishlist WHERE user_id = ?`;

            // Delete user reviews from product review
            const deleteReviewQuary = `DELETE FROM product_reviews WHERE user_id = ?`;

            // Execute all queries
            await connection.query(deleteUserQuery, [user_id], (err, result) => {
                if (err) throw err;
            });

            await connection.query(deleteCartQuery, [user_id], (err, result) => {
                if (err) throw err;
            });

            await connection.query(deleteWishlistQuery, [user_id], (err, result) => {
                if (err) throw err;
            });

            await connection.query(deleteReviewQuary, [user_id], (err, result) => {
                if (err) throw err;
            });

            // Commit the transaction if all queries succeed
            await connection.commit();

            console.log('deleted user')

            res.status(200).send({ success: true });

        } catch (err) {
            // Rollback the transaction in case of error
            await connection.rollback();
            console.error('Error deleting account and related data:', err);
            res.status(500).send({ message: 'Failed to delte account' });

        } finally {
            connection.release(); // Always release the connection
        }
    });

});


module.exports = router;