const path = require('path');
const multer = require('multer');
const { ImgurClient } = require('imgur');
const { successHandler, errorHandler } = require('../utils/responseHandler');

const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
      return cb(
        new Error('檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。'),
        false
      );
    }
    cb(null, true);
  },
}).any();

module.exports = {
  uploadImage: function (req, res, next) {
    upload(req, res, async (error) => {
      if (error) {
        return errorHandler(res, error);
      }
      try {
        const client = new ImgurClient({
          clientId: process.env.IMGUR_CLIENTID,
          clientSecret: process.env.IMGUR_CLIENT_SECRET,
          refreshToken: process.env.IMGUR_REFRESH_TOKEN,
        });
        const response = await client.upload({
          image: req.files[0].buffer.toString('base64'),
          type: 'base64',
          album: process.env.IMGUR_ALBUM_ID,
        });
        successHandler(res, { url: response.data.link });
      } catch (error) {
        return errorHandler(res, error);
      }
    });
  },
};
