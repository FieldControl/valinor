const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({'oi': 'teste'});
});

module.exports = router;