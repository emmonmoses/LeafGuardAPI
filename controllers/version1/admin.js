// MODELS
const Role = require("../../models/role");
const Administrator = require("../../models/admin");
const Pagination = require("../../models/pagination");

// VALIDATIONS
const { administratorValidation } = require("../../validations/admin");

// UTILITIES
const DateUtil = require("../../utilities/date_utility");
const { login } = require("../../utilities/login_utility");
const Response = require("../../utilities/response_utility");
const unique = require("../../utilities/codegenerator_utility");
const ResponseMessage = require("../../utilities/messages_utility");
const PaginationUtility = require("../../utilities/pagination_utility");
const { resetPassword } = require("../../utilities/resetpassword_utility");
const { changePassword } = require("../../utilities/changepassword_utility");
const { createActivityLog } = require("../../utilities/activitylog_utility");

const moduleName = `Administrators`;

module.exports = {
  login: async (req, res) => {
    await login(req, res, Administrator);
  },

  changePassword: async (req, res) => {
    await changePassword(req, res, Administrator, moduleName);
  },

  resetPassword: async (req, res) => {
    await resetPassword(req, res, Administrator, moduleName);
  },

  createAdministrator: async (req, res) => {
    try {
      const body = req.body;
      const { error } = administratorValidation(body);

      if (error) {
        return Response.sendValidationErrorMessage(res, 400, error);
      }

      const existingEmail = await Administrator.findOne({
        email: body.email,
      });

      if (existingEmail) {
        return Response.customResponse(res, 409, ResponseMessage.EMAIL_EXISTS);
      }

      const existingName = await Administrator.findOne({
        name: body.name,
      });

      if (existingName) {
        return Response.customResponse(res, 409, ResponseMessage.NAME_EXISTS);
      }

      const role = await Role.findById(body.roleId);

      if (!role) {
        return Response.customResponse(res, 404, ResponseMessage.NO_ROLE);
      }

      const uniqueCode = unique.randomCode();
      const hashedPassword = unique.passwordHash(body.password);

      const user = new Administrator({
        adminNumber: "AD" + uniqueCode,
        username: body.email,
        name: body.fullname,
        email: body.email,
        password: hashedPassword,
        roleId: body.roleId,
        avatar: body.avatar.replace(/\s+/g, ""),
        usertype: "0",
        status: body.status,
        createdAt: DateUtil.currentDate(),
      });

      const newUser = await user.save();

      const action = `New ${moduleName} - ${"AD" + uniqueCode}`;
      const person = body.actionBy;

      await createActivityLog(moduleName, action, person);

      return res.status(res.statusCode).json(newUser);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAdministrators: async (req, res) => {
    try {
      const totalUsers = await Administrator.countDocuments({
        // role: "admin",
        usertype: 0,
      });

      const { pagination, skip } = await PaginationUtility.paginationParams(
        req,
        totalUsers
      );

      if (pagination.page > pagination.pages) {
        return Response.customResponse(
          res,
          res.statusCode,
          ResponseMessage.OUTOF_DATA
        );
      }

      pagination.data = await Administrator.find({
        // role: "admin",
        usertype: 0,
      })
        .populate([
          { path: "role", select: "name claims" },
          {
            path: "company",
            select: "name email",
          },
        ])
        .select("-password -activity")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (totalUsers === 0) {
        return Response.customResponse(
          res,
          res.statusCode,
          ResponseMessage.NO_DATA
        );
      }

      pagination.data = pagination.data.map((item) => ({
        ...item.toJSON(),
        role: item.role ? item.role.name : null,
        company: item.usertype == 0 ? "LeafGuard" : item.company.name,
        permissions: item.role ? item.role.claims : null,
      }));

      return Response.paginationResponse(res, res.statusCode, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getUsersByRole: async (req, res) => {
    try {
      const role = await Role.findById(req.params.id);

      if (!role) {
        return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      const roleId = role._id;
      const totalUsers = await Administrator.countDocuments({
        roleId: roleId,
      });

      const { pagination, skip } = await PaginationUtility.paginationParams(
        req,
        totalUsers
      );

      if (pagination.page > pagination.pages) {
        return Response.customResponse(
          res,
          res.statusCode,
          ResponseMessage.OUTOF_DATA
        );
      }

      pagination.data = await Administrator.find({
        roleId: roleId,
      })
        .populate([
          { path: "role", select: "name claims" },
          {
            path: "company",
            select: "name email",
          },
        ])
        .select("-password -activity")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (totalUsers === 0) {
        return Response.customResponse(
          res,
          res.statusCode,
          ResponseMessage.NO_DATA
        );
      }

      pagination.data = pagination.data.map((item) => ({
        ...item.toJSON(),
        role: item.role ? item.role.name : null,
        company: item.usertype == 0 ? "LeafGuard" : item.company.name,
        permissions: item.role ? item.role.claims : null,
      }));

      return Response.paginationResponse(res, res.statusCode, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAdministrator: async (req, res) => {
    try {
      const user = await Administrator.findById(req.params.id)
        .select("-password")
        .populate([
          {
            path: "role",
            select: "name claims",
          },
          {
            path: "company",
            select: "name email",
          },
        ]);

      if (!user) {
        return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      var userData = {
        id: user._id,
        code: user.adminNumber,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        role: user.role ? user.role.name : null,
        company: user.usertype == 0 ? "LeafGuard" : user.company.name,
        createdAt: user.createdAt,
        permissions: user.role ? user.role.claims : null,
      };

      return Response.successResponse(res, res.statusCode, userData);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  updateAdministrator: async (req, res) => {
    try {
      const { id, ...adminData } = req.body;
      const user = await Administrator.findById(body.id);

      if (!user) {
        return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      user.set(adminData);
      const updatedUser = await user.save();

      const action = `Updated ${moduleName} - ${user.adminNumber}`;
      const person = body.actionBy;

      await createActivityLog(moduleName, action, person);

      return res.status(res.statusCode).json(updatedUser);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  deleteAdministrator: async (req, res) => {
    try {
      const param = req.params;
      const userId = param.userId;

      const user = await Administrator.findById(param.id);

      if (!user) {
        return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      await user.deleteOne();

      const action = `Deleted ${moduleName} - ${user.adminNumber}`;
      await createActivityLog(moduleName, action, userId);

      return res.status(res.statusCode).json({
        message: ResponseMessage.SUCCESS_MESSAGE,
      });
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
};
