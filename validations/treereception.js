// In your validation file (e.g., validations/treereception.js)
const Joi = require("joi");

const treereceptionValidation = (data) => {
  const schema = Joi.object({
    sourceType: Joi.string()
      .valid(
        "Government",
        "NGO'S",
        "Community",
        "Private Company",
        "Individuals"
      )
      .required(),
    sourceName: Joi.string().required(),
    contactPersonName: Joi.string().required(),
    address: Joi.string().required(),
    email: Joi.string().email().required(),
    dateReceived: Joi.date().iso().required(),
    numberOfTrees: Joi.number().integer().min(1).required(),
    typeOfTrees: Joi.string().required(),
    conditionOfTrees: Joi.string()
      .valid("Excellent", "Good", "Fair", "Poor")
      .required(),
    receivedBy: Joi.string().required(),
    approvalStatus: Joi.string()
      .valid("Approved", "Pending", "Rejected")
      .required(),
    verifiedDate: Joi.date().iso().required(),
    verifiedBy: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports.treereceptionValidation = treereceptionValidation;
