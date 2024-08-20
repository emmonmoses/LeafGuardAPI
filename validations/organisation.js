const Joi = require("joi");

// Define the schema for tree validation
const treeSchema = Joi.object({
  TreesType: Joi.string().required(),
  numberOfTrees: Joi.number().required(),
  code: Joi.string().required(),
});

// Define the schema for organisation validation
const organisationValidation = (data) => {
  const schema = Joi.object({
    organisationName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    email: Joi.string().required().email(),
    typeOfOrganisation: Joi.string().required(),
    kabale: Joi.string().required(),
    houseNo: Joi.string().required(),
    trees: Joi.array().items(treeSchema).default([]),
    type: Joi.string().default("organisation"),
  });

  return schema.validate(data);
};

module.exports = {
  organisationValidation,
};
