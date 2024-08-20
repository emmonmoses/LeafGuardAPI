const ResponseMessage = require("./messages_utility");
const Response = require("../utilities/response_utility");
const DateUtil = require("../utilities/date_utility");
const { createActivityLog } = require("../utilities/activitylog_utility");
const { updateStatusValidation } = require("../validations/updateStatus");
const status = async (req, res, model, moduleName) => {
  try {
    const body = req.body;

    const error = updateStatusValidation(body);

    if (error) {
      return Response.errorResponse(res, 400, error);
    }

    const updateOperation = {
      $set: {
        status: parseInt(body.status),
        updatedAt: DateUtil.currentDate(),
      },
    };

    const foundData = await model.findByIdAndUpdate(body.id, updateOperation);

    if (!foundData) {
      return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
    }

    const action = `Updatedd ${moduleName} status to ${body.status} - ${foundData._id}`;
    const person = body.actionBy;
    await createActivityLog(moduleName, action, person);

    return Response.customResponse(
      res,
      res.statusCode,
      ResponseMessage.DATA_DEACTIVATED
    );
  } catch (err) {
    return Response.errorResponse(res, 500, err);
  }
};

module.exports = { status };
