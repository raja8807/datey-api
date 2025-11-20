const express = require('express');

const router = express.Router();

router.use('/healthcheck', (_, res) => res.send('Healthy'));
router.use('/auth', require('./auth/auth.routes'));

router.use('/user', require('./user/user.routes'));

module.exports = router;
