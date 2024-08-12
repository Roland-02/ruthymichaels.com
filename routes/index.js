//handle GET request for /home, load film data
var express = require('express');
const { getConnection } = require('../database');
const mysql = require('mysql');
const router = express.Router();
var crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const IV_LENGTH = 16; // AES block size for CBC mode

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

// get products endpoint
router.get('/get_products', async (req, res) => {
    getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).send('Database connection failed');
        }

        const query = 'SELECT id, name, type, description, price, image_URLs FROM products';
        connection.query(query, (error, results) => {
            connection.release();

            if (error) {
                console.error('Database query failed:', error);
                return res.status(500).send('Database query failed');
            }

            if (results.length == 0) {
                return res.status(404).send('No products not found');
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

            const query = 'SELECT id, name, type, description, price, image_URLs FROM products WHERE id = ?';
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

            const query = 'SELECT id, name, type, description, price, image_URLs FROM products WHERE name = ?';
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

        const query = `SELECT id, name, type, description, price, image_URLs FROM products WHERE id IN (${placeholders})`;
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

        const sqlQuery = `SELECT * FROM products WHERE name LIKE ? OR type LIKE ? OR description LIKE ?`;
        const searchTerm = `%${query}%`;

        connection.query(sqlQuery, [searchTerm, searchTerm, searchTerm], (err, results) => {
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
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).send('User ID and Product ID are required');
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

// POST route to store or update user address
router.post('/save_address', async (req, res) => {
    try {
        const { user_id, line_1, line_2, city, country, postcode } = req.body;

        // Validate required fields
        if (!user_id || !line_1 || !city || !country || !postcode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Encrypt the address fields
        const encryptedLine1 = encrypt(line_1);
        const encryptedLine2 = line_2 ? encrypt(line_2) : null;
        const encryptedCity = encrypt(city);
        const encryptedCountry = encrypt(country);
        const encryptedPostcode = encrypt(postcode);

        getConnection(async (err, connection) => {
            if (err) throw err;

            const query = `
                INSERT INTO user_address (user_id, line_1, line_2, city, country, postcode)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    line_1 = VALUES(line_1),
                    line_2 = VALUES(line_2),
                    city = VALUES(city),
                    country = VALUES(country),
                    postcode = VALUES(postcode);
            `;

            connection.query(query, [user_id, encryptedLine1, encryptedLine2, encryptedCity, encryptedCountry, encryptedPostcode], (error, results) => {
                connection.release();

                if (error) {
                    console.error(error);
                    return res.status(500).send('Database update failed');
                }
                res.status(200).json({ message: 'Address saved/updated successfully' });
            });
        });

    } catch (error) {
        console.error('Error saving address:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get the user's address
router.get('/get_address/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        getConnection(async (err, connection) => {
            if (err) throw err;

            const query = 'SELECT * FROM user_address WHERE user_id = ?';
            const search_query = mysql.format(query, [userId]);

            connection.query(search_query, async (err, result) => {
                if (err) throw err;

                if (result.length === 0) {
                    return res.status(404).json({ message: 'Address not found' });
                }

                const address = result[0];

                // Decrypting the address fields
                const decryptedAddress = {
                    line_1: decrypt(address.line_1),
                    line_2: decrypt(address.line_2),
                    city: decrypt(address.city),
                    country: decrypt(address.country),
                    postcode: decrypt(address.postcode)
                };

                res.json(decryptedAddress);

            });
        });

    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;