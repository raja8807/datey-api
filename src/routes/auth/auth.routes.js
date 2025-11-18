const express = require('express');

const router = express.Router();

router.use('/otp', require('./otp/auth.otp.routes'));

module.exports = router;
