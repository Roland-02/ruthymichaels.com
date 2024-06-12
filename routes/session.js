const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const session = {
        email: req.cookies.sessionEmail || null,
        id: req.cookies.sessionID || null,
    };
    res.json(session);
});

module.exports = router;
