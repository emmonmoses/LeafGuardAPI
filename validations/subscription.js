const Joi = require("joi");

const subscriptionValidation = (data) => {
  const schema = Joi.object({
    propertyType: Joi.string().required(),
    location: Joi.string().allow(""),
    customerId: Joi.string().required(),
    bedRoomId: Joi.string().required(),
    adminId: Joi.string().required(),
    feeTypes: Joi.array().items(
      Joi.object({
        id: Joi.string().allow(""),
      })
    ).default([]),
    description: Joi.string().allow(""),
    status: Joi.bool(),
    actionBy: Joi.string().allow(""),
  });
  return schema.validate(data);
};

module.exports.subscriptionValidation = subscriptionValidation;
