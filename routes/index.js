//handle GET request for /home, load film data
var express = require('express');
const { getConnection } = require('../database');
const router = express.Router();
const mysql = require('mysql');
var bcrypt = require('bcrypt');
var crypto = require('crypto');



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

            res.status(200).json(results);
        });
    });
});


module.exports = router;
