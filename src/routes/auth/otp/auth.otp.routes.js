const express = require('express');
const { sendOtp } = require('../../../controllers/auth/otp/otp.controler');

const router = express.Router();

router.post('/send', sendOtp);

module.exports = router;
