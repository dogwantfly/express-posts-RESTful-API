
const { successHandler } = require('../utils/responseHandler');
const upload = require('../service/image');
const { v4: uuidv4 } = require('uuid');
const firebaseAdmin = require('../service/firebase');
const bucket = firebaseAdmin.storage().bucket();
const multer = require('multer');
const appError = require("../statusHandle/appError"); 


module.exports = {
  uploadImage: function (req, res, next) {
    upload(req, res, async (error) => {
      console.log(error)
      if (error && error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new appError(400, "檔案大小不能超過 2MB"))  
        }
      } else if (error) {
        next(new appError(500, error.message))
      }
      if(!req.files.length) {
        return next(new appError(400, "尚未上傳檔案"));
      }
      // 取得上傳的檔案資訊列表裡面的第一個檔案
      const file = req.files[0];
      // 基於檔案的原始名稱建立一個 blob 物件
      const blob = bucket.file(`images/${uuidv4()}.${file.originalname.split('.').pop()}`);
      // 建立一個可以寫入 blob 的物件
      const blobStream = blob.createWriteStream()

      // 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
      blobStream.on('finish', () => {
        // 設定檔案的存取權限
        const config = {
          action: 'read', // 權限
          expires: '12-31-2500', // 網址的有效期限
        };
        // 取得檔案的網址
        blob.getSignedUrl(config, (err, fileUrl) => {
          if (err) {
            return next(new appError(500, err.message));
          }
          successHandler(res, { url: fileUrl });
        });
      });

      // 如果上傳過程中發生錯誤，會觸發 error 事件
      blobStream.on('error', (err) => {
        next(new appError(500, `上傳失敗：${err}`))
      });

      // 將檔案的 buffer 寫入 blobStream
      blobStream.end(file.buffer);
    });
  },
};
