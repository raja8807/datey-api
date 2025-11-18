const express = require('express');

const router = express.Router();

router.use('/healthcheck', (req, res) => {
  res.send('Healthy');
});

router.use('/auth', require('./auth/auth.routes'));

module.exports = router;
