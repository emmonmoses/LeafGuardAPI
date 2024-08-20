const Role = require("../models/role");
const Permission = require("../models/permission");

const { sign } = require("jsonwebtoken");
const { compareSync } = require("bcryptjs");

const DateUtil = require("../utilities/date_utility");
const Response = require("../utilities/response_utility");
const ResponseMessage = require("./messages_utility");
const { loginValidation } = require("../validations/login");
const { createActivityLog } = require("../utilities/activitylog_utility");
const moduleName = `SignIn`;
const loginStatus = 1;

const login = async (req, res, model) => {
  const body = req.body;
  const { error } = loginValidation(body);

  if (error) {
    return Response.sendValidationErrorMessage(res, 400, error);
  }

  const user = await model.findOne({ email: body.username });

  if (!user) {
    return Response.customResponse(res, 400, ResponseMessage.INVALID_USERNAME);
  }

  if (!user.status) {
    return Response.customResponse(res, 400, ResponseMessage.UNAUTHORIZED_USER);
  }

  const validPassword = compareSync(body.password, user.password);

  if (!validPassword) {
    return Response.customResponse(res, 400, ResponseMessage.INVALID_PASSWORD);
  }

  user.password = undefined;

  const jsontoken = sign({ key: user }, process.env.JWK_SECRET, {
    expiresIn: process.env.JWK_EXPIRATION,
  });

  // GET THE USER ROLE AND ASSOCIATED PERMISSIONS
  const role = await Role.findById({ _id: user.roleId });
  // const claims = role.claims;

  // GET ALL THE MODULE PERMISSIONS FOR ADMIN
  const allRoles = await Permission.find({ isCompany: { $in: [0, 2] } });
  var claims = allRoles;

  if (!role) {
    return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
  }

  const action = `Account ${moduleName} For - ${user.code}`;
  const person = user._id;

  await createActivityLog(moduleName, action, person);

  return res.status(res.statusCode).json({
    status: loginStatus,
    id: user._id,
    admin: user.code,
    name: user.name,
    username: user.email,
    email: user.email,
    avatar: user.avatar,
    role: role.name,
    permissions: claims,
    token: {
      validFor: process.env.JWK_EXPIRATION,
      validFrom: DateUtil.validFromDate(),
      validUpto: DateUtil.expirationDate(),
      token: jsontoken,
    },
    created: user.createdAt,
  });
};

module.exports = { login };
