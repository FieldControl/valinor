const express = require('express');
const router = express.Router();
const filmeController = require('../controllers/filmeController');

router.get('/', filmeController.list);
router.get('/:id', filmeController.get);
router.post('/', filmeController.create);
router.put('/:id', filmeController.update);
router.patch('/:id', filmeController.patch);
router.delete('/:id', filmeController.delete);

module.exports = router;