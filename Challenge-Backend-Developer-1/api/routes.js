let router = require('express').Router();
let routerV1 = require('./v1/routes');

router.use('/v1', routerV1);

module.exports = router;