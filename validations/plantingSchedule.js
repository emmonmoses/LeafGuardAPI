const Joi = require('joi');

const plantingScheduleValidation = (data) => {
    const schema = Joi.object({
        siteName: Joi.string().required(),
        numberOfTrees: Joi.number().required(),
        AssignedBy: Joi.string().required(),
        responsibleTeam: Joi.string().required(),
        note: Joi.string().optional()
    });

    return schema.validate(data);
};

module.exports = {
    plantingScheduleValidation
};
