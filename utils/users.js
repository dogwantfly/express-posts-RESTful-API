const appError = require('../statusHandle/appError');
const validator = require('validator');

function validatePassword(password) {
  if (!validator.isLength(password, { min: 8 })) {
    throw new appError(400, '密碼字數低於 8 碼');
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new appError(400, '密碼需包含英文與數字混合');
  }
}

const isSexInEnum = (value, enumArray) => {
  return enumArray.includes(value);
};
const validSexValues = ['male', 'female'];

module.exports = {
  validatePassword,
  isSexInEnum,
  validSexValues,
};
