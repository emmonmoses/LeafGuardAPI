const Joi = require("joi");

const loginValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(4).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });
  return schema.validate(data);
};

module.exports.loginValidation = loginValidation;
