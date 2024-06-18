//handle GET request for /home, load film data
var express = require('express');
const { getConnection } = require('../database');
const router = express.Router();

// Get products endpoint
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

            if (results.length == 0){
                return res.status(404).send('No products not found');
            }

            res.status(200).json(results);
        });
    });
});

// Get products endpoint
router.get('/get_product/:id', async (req, res) => {
    const { id } = req.params;
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
});

module.exports = router;
