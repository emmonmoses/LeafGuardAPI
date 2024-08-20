const Joi = require('joi');

const monitoringScheduleValidation = (data) => {
    const schema = Joi.object({
        beginFrom: Joi.date().required(),
        end: Joi.date().required(),
        site: Joi.string().required(),
        AssignedBy: Joi.string().required(),
        responsibleTeam: Joi.string().required(),
        note: Joi.string().optional()
    });

    return schema.validate(data);
};

module.exports = {
    monitoringScheduleValidation
};
