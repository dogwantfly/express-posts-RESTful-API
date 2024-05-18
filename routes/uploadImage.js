const express = require('express');
const router = express.Router();
const uploadControllers = require('../controllers/uploadImage.js');
const handleErrorAsync = require('../statusHandle/handleErrorAsync');
const { isAuth } = require('../statusHandle/auth');

router.post('/', isAuth, handleErrorAsync(uploadControllers.uploadImage));

module.exports = router;
