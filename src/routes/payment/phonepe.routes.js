const express = require('express');
const {
  initiatePayment,
  checkPaymentStatusAndSendJob,
} = require('../../controllers/payment/payment.controller');

const router = express.Router();

router.post('/initiate', initiatePayment);
router.post('/status', checkPaymentStatusAndSendJob);
// router.get('/status/:merchantTransactionId', asyncHandler(getPaymentStatus));
// router.post('/callback', asyncHandler(paymentCallback));
// router.get('/redirect', asyncHandler(redirectHandler));

module.exports = router;
