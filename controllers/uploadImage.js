const path = require('path');
const multer = require('multer');
const { ImgurClient } = require('imgur');
const { successHandler, errorHandler } = require('../utils/responseHandler');
const upload = require('../service/image');
const { v4: uuidv4 } = require('uuid');
const firebaseAdmin = require('../service/firebase');
const bucket = firebaseAdmin.storage().bucket();


module.exports = {
  uploadImage: function (req, res, next) {
    upload(req, res, async (error) => {
      if (error) {
        return errorHandler(res, error);
      }
      try {
        if(!req.files.length) {
          return next(appError(400,"尚未上傳檔案",next));
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
            successHandler(res, { url: fileUrl });
          });
        });

        // 如果上傳過程中發生錯誤，會觸發 error 事件
        blobStream.on('error', (err) => {
          errorHandler(res, '上傳失敗', 500)
        });

        // 將檔案的 buffer 寫入 blobStream
        blobStream.end(file.buffer);
        
        
      } catch (error) {
        return errorHandler(res, error);
      }
    });
  },
};
