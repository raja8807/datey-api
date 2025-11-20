const express = require('express');
const {
  getCurrentUser,
  updateCurrentUser,
} = require('../../controllers/user/user.controller');
const verifyAuthToken = require('../../middleware/authenticate');

const router = express.Router();

router.get('/currentUser', verifyAuthToken, getCurrentUser);
router.put('/currentUser', verifyAuthToken, updateCurrentUser);

module.exports = router;
