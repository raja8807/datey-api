const express = require('express');
const verifyAuthToken = require('../../middleware/authenticate');
const {
  getInterests,
} = require('../../controllers/interest/interest.controller');

const router = express.Router();

router.get('/', verifyAuthToken, getInterests);

module.exports = router;
