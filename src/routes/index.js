const express = require('express');

const router = express.Router();

router.use('/healthcheck', (req, res) => {
  res.send('Healthy');
});

module.exports = router;
