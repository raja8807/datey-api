const express = require('express');

const {
  getMoviesByQuery,
} = require('../../controllers/movies/movies.controller');

const router = express.Router();

router.post('/', getMoviesByQuery);

module.exports = router;
