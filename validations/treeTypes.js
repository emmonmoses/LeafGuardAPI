const Joi = require("joi");

const treeTypeValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    status: Joi.number().integer().valid(0, 1).required(),
  });

  return schema.validate(data);
};

module.exports = {
  treeTypeValidation,
};
