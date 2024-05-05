const express = require('express');
const router = express.Router();
const uploadControllers = require('../controllers/uploadImage.js');

router.post('/', uploadControllers.uploadImage);

module.exports = router;
