const Joi = require("joi");

const statusValidation = (data) => {
  const schema = Joi.object({
    condition: Joi.string()
      .valid('Excellent', 'Good', 'Fair', 'Poor')
      .required(),
  });

  return schema.validate(data);
};

module.exports.statusValidation = statusValidation;
