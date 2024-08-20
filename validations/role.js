const Joi = require("joi");

const roleValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    claims: Joi.array().items().required(),
    actionBy: Joi.string().required(),
  });
  return schema.validate(data);
};

module.exports.roleValidation = roleValidation;
