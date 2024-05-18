const appError = require('../statusHandle/appError');
const validator = require('validator');

function validatePassword(password) {
  if (!validator.isLength(password, { min: 8 })) {
    throw new appError(400, '密碼字數低於 8 碼');
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
