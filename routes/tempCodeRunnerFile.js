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