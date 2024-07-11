//handle GET request for /home, load film data
var express = require('express');
const { getConnection } = require('../database');
const router = express.Router();


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
router.get('/get_cart_products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        getConnection((err, connection) => {
            if (err) throw err;

            const query = `SELECT product_id FROM user_basket WHERE user_id = ?`;

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

router.post('/update_cart', async (req, res) => {
    try {
        const { user_id, product_id, qty } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).send('User ID and Product ID are required');
        }

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'INSERT INTO user_basket (user_id, product_id, qty) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE qty = VALUES(qty)';
            connection.query(query, [user_id, product_id, qty], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error inserting into user_basket:', error);
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

            const query = 'DELETE FROM user_basket WHERE user_id = ? AND product_id = ?';
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

// route to get loved products for a user
router.get('/get_wishlist/:id', async (req, res) => {
    const { id } = req.params;

    try {
        getConnection((err, connection) => {
            if (err) throw err;

            const query = `SELECT product_id FROM user_loved WHERE user_id = ?`;

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

router.post('/add_wishlist', async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).send('User ID and Product ID are required');
        }

        getConnection((err, connection) => {
            if (err) throw err;

            const query = 'INSERT INTO user_loved (user_id, product_id) VALUES (?, ?)';
            connection.query(query, [user_id, product_id], (error, results) => {
                connection.release();

                if (error) {
                    console.error('Error inserting into user_loved:', error);
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

            const query = 'DELETE FROM user_loved WHERE user_id = ? AND product_id = ?';
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


module.exports = router;