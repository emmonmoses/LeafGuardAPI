// MODELS
const Role = require("../../models/role");

// VALIDATIONS
const { roleValidation } = require("../../validations/role");

// UTILITIES
const Response = require("../../utilities/response_utility");
const date_utility = require("../../utilities/date_utility");
const ResponseMessage = require("../../utilities/messages_utility");
const PaginationUtility = require("../../utilities/pagination_utility");
const { createActivityLog } = require("../../utilities/activitylog_utility");

const moduleName = "Role";

module.exports = {
  create: async (req, res) => {
    try {
      const roleData = req.body;

      const { error } = roleValidation(roleData);

      if (error) {
        return Response.errorResponse(res, 400, error);
      }

      const priviledge = new Role({
        name: roleData.name,
        description: roleData.description,
        claims: roleData.claims,
        createdAt: date_utility.currentDate(),
      });

      const newPriviledge = await priviledge.save();

      const action = `New ${moduleName}`;
      const person = roleData.actionBy;
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(res, res.statusCode, newPriviledge);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getroles: async (req, res) => {
    try {
      const totalrole = await Role.countDocuments();
      const { pagination, skip } = await PaginationUtility.paginationParams(
        req,
        totalrole,
      );

      if (pagination.page > pagination.pages) {
        return res.status(200).json({
          message: `Page number ${pagination.page} is greater than the total number of pages that is ${pagination.pages}`,
        });
      }

      pagination.data = await Role.find()

        .select("-updatedAt -createdAt")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize)
        .lean();

      pagination.data = pagination.data.map((role) => {
        role.id = role._id.toHexString();

        return role;
      });

      if (pagination.data.length === 0) {
        return Response.customResponse(
          res,
          res.statusCode,
          ResponseMessage.NO_DATA
        );
      }

      return Response.paginationResponse(res, res.statusCode, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getRoleById: async (req, res) => {
    try {
      const roleId = req.params.id;

      const role = await Role.findById(roleId).select("-updatedAt -createdAt").lean();

      if (!role) {
        return Response.errorResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      role.id = role._id.toHexString();

      return Response.successResponse(res, res.statusCode, role);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  delete: async (req, res) => {
    try {
      const grant = await Role.findById(req.params.id);

      if (!grant) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      await grant.deleteOne();

      const action = `Deleted ${moduleName} - ${grant._id}`;
      const person = req.param.createdBy;
      await createActivityLog(moduleName, action, person);

      return Response.customResponse(
        res,
        res.statusCode,
        ResponseMessage.SUCCESS_MESSAGE
      );
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  update: async (req, res) => {
    try {
      const priviledge = await Role.findById(req.body.id);

      if (!priviledge) {
        return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
      }
      priviledge.name = req.body.name || priviledge.name;
      priviledge.description = req.body.description || priviledge.description;
      priviledge.claims = req.body.claims || priviledge.claims;
      priviledge.updatedAt = date_utility.currentDate();
      const updatedPriviledge = await priviledge.save();

          const action = `Updated ${moduleName} - ${priviledge._id}`;
      const person = req.body.createdBy;
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(res, res.statusCode, updatedPriviledge);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
};
