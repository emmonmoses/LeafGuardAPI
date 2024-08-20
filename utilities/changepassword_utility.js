const bcrypt = require("bcryptjs");

const Response = require("./response_utility");
const ResponseMessage = require("./messages_utility");
const unique = require("../utilities/codegenerator_utility");
const { createActivityLog } = require("../utilities/activitylog_utility");
const { changePasswordValidation } = require("../validations/changePassword");

const changePassword = async (req, res, model, moduleName) => {
  try {
    const body = req.body;
    const { error } = changePasswordValidation(body);

    if (error) {
      return Response.errorResponse(res, 400, error);
    }

    const user = await model.findById(body.userId);

    if (!user) {
      return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
    }

    const isPasswordValid = bcrypt.compareSync(body.oldPassword, user.password);

    if (!isPasswordValid) {
      return Response.customResponse(
        res,
        400,
        ResponseMessage.PASSWORD_INCORRECT
      );
    }

    const hashedPassword = unique.passwordHash(body.newPassword);
    user.password = hashedPassword;

    await user.save();

    const action = `Changed Password - ${user.code}`;
    await createActivityLog(moduleName, action, body.userId);

    return Response.customResponse(
      res,
      res.statusCode,
      ResponseMessage.SUCCESS_MESSAGE
    );
  } catch (err) {
    return Response.errorResponse(res, 500, err);
  }
};

module.exports = { changePassword };
