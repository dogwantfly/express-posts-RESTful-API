var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const appError = require('../statusHandle/appError'); 
const handleErrorAsync = require('../statusHandle/handleErrorAsync');
const { isAuth, generateSendJWT } = require('../statusHandle/auth');
const User = require('../models/users');
const { successHandler } = require('../utils/responseHandler');

function verifyToken(req, res, next) {
  // 取出 token，token 通常存放在 headers 的 authorization 這個屬性中
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 檢查 token 是否存在
  if (!token) return res.status(401).json({ message: '尚未登入！' });

  // 驗證 token
  jwt.verify(token, secret, async (err, payload) => {
    if (err) return res.status(401).json({ message: 'token 驗證失敗' });
    
    const currentUser = await User.findById(payload.id);
    req.user = currentUser;
    next();
  });
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sign_up', handleErrorAsync(async(req, res, next) =>{
  let { email, password, confirmPassword, name } = req.body;
  // 內容不可為空
  if(!email || !password || !confirmPassword || !name){
    return next(new appError(400, "欄位未填寫正確！", next));
  }
  // 密碼正確
  if(password !== confirmPassword){
    return next(new appError(400, "密碼不一致！", next));
  }
  // 密碼 8 碼以上
  if(!validator.isLength(password, {min: 8})){
    return next(new appError(400, "密碼字數低於 8 碼", next));
  }
  // 是否為 Email
  if(!validator.isEmail(email)){
    return next(new appError(400, "Email 格式不正確", next));
  }
  
  // 加密密碼
  password = await bcrypt.hash(req.body.password,12);
  const newUser = await User.create({
    email,
    password,
    name
  });
  generateSendJWT(newUser,201,res);
}))

router.post('/sign_in', handleErrorAsync(async(req, res, next) =>{
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError(400, '帳號密碼不可為空', next));
  }
  const user = await User.findOne({ email }).select('+password');
  if(!user){
    return next(new appError(400, '帳號或密碼不正確', next));
  }
  const auth = await bcrypt.compare(password, user.password);
  if(!auth){
    return next(new appError(400, '您的密碼不正確', next));
  }
  generateSendJWT(user, 200, res);
}))

router.post('/updatePassword', isAuth, handleErrorAsync(async(req,res,next)=>{
  const { password, confirmPassword } = req.body;
  if(password !== confirmPassword){
    return next(new appError(400, "密碼不一致！", next));
  }
  if(!validator.isLength(password, {min: 8})){
    return next(new appError(400, "密碼字數低於 8 碼", next));
  }
  
  const newPassword = await bcrypt.hash(password, 12);
  
  const user = await User.findByIdAndUpdate(req.user.id, {
    password: newPassword
  },{new: true, runValidators: true});
  generateSendJWT(user, 200, res)
}))

router.get('/profile', isAuth, handleErrorAsync(async(req, res, next) => {
  successHandler(res, req.user);
}));
const isInEnum = (value, enumArray) => {
  return enumArray.includes(value);
};
const validValues = ['male', 'female'];
router.patch('/profile', isAuth, handleErrorAsync(async(req, res, next) => {
  const { name, sex } = req.body;
  if(!name){
    return next(new appError(400, "暱稱不可為空", next));
  }
  if(!validator.isLength(name.trim(), {min: 2})){
    return next(new appError(400, "暱稱至少 2 個字元以上", next));
  }
  if(!sex){
    return next(new appError(400, "性別不可為空", next));
  }
  if(!isInEnum(sex, validValues)){
    return next(new appError(400, "性別填寫錯誤", next));
  }
  if(!validator.isLength(sex.trim(), {min: 2})){
    return next(new appError(400, "性別至少 2 個字元以上", next));
  }

  const user = await User.findByIdAndUpdate(req.user.id, {
    name,
    sex
  }, {new: true, runValidators: true});
  if(!user){
    return next(new appError(400, "更新失敗！", next));
  }

  successHandler(res, req.user);
}));

module.exports = router;
