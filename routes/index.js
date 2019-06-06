var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/fuck', function(req, res, next) {
  res.send('my first resopond');
});

module.exports = router;
