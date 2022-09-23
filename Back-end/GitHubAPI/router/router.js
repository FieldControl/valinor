const express = require('express');
const router = express.Router();
const controller = require('../controller/controller');

router.get('/SearchRepository/GitHub/:repos', controller.searchRepositoryGitHub);

module.exports = router;