const Joi = require("joi");

const individualValidation = (data) => {
  const treeSchema = Joi.object({
    TreesType: Joi.string().required(),
    numberOfTrees: Joi.number().integer().min(1).required(),
    code: Joi.string().required(),
  });

  const schema = Joi.object({
    fullName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid('M', 'F').required(),
    kabale: Joi.string().required(),
    houseNo: Joi.string().required(),
    trees: Joi.array().items(treeSchema).required(),
  });

  return schema.validate(data);
};

module.exports.individualValidation = individualValidation;
