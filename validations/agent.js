const Joi = require("joi");

const agentValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().min(4).required().email(),
    password: Joi.string()
      .min(6)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]+$/
      )
      .message(
        "Password must be atleast six characters long, must contain an uppercase and lowercase letter, a number and a special character"
      )
      .required(),
    status: Joi.bool(),
    roleId: Joi.string().allow(""),
    actionBy: Joi.string().allow(""),
  });
  return schema.validate(data);
};

module.exports.agentValidation = agentValidation;
