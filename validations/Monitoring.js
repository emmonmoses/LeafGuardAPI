const Joi = require('joi');

const treeSchema = Joi.object({
  code: Joi.string().required(),
  status: Joi.string().required(),
});

const monitoringValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    kabale: Joi.string().required(),
    houseNumber: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    trees: Joi.array().items(treeSchema).required(),
  });

  return schema.validate(data);
};

module.exports = { monitoringValidation };
