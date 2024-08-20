const Joi = require("joi");

const administratorValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3),
    email: Joi.string().min(4).required().email(),
    username: Joi.string().min(4).allow(""),
    password: Joi.string()
    .min(6)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]+$/
    )
    .message(
      "Password must be atleast six characters long, must contain an uppercase and lowercase letter, a number and a special character"
    )
    .required(),
    status: Joi.number(),
    roleId: Joi.string().allow(""),
    actionBy: Joi.string().allow("")
  });
  return schema.validate(data);
};

module.exports.administratorValidation = administratorValidation;