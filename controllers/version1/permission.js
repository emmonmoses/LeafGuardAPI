const { createActivityLog } = require("../../utilities/activitylog_utility");
const Permission = require("../../models/permission"); // Ensure the correct path to the Permission model
const Response = require("../../utilities/response_utility");
const ResponseMessage = require("../../utilities/messages_utility");
const PaginationUtiliy = require("../../utilities/pagination_utility");
const DateUtil = require("../../utilities/date_utility");
const moduleName = `Permission`;

module.exports = {
  create: async (req, res) => {
    try {
      const permissions = req.body;

      // Validate request body format
      if (!Array.isArray(permissions)) {
        return Response.customResponse(
          res,
          400,
          ResponseMessage.INVALID_FORMAT
        );
      }

      const modules = permissions.map((permission) => permission.module);

      // Find existing modules
      const existingPermissions = await Permission.find({
        module: { $in: modules },
      });
      const existingModules = existingPermissions.map(
        (permission) => permission.module
      );

      // If there are existing modules, return them
      if (existingModules.length > 0) {
        return res.status(400).json({
          message: ResponseMessage.MODULE_EXISTS,
          existingModules,
        });
      }

      const savedPermissions = [];

      for (let i = 0; i < permissions.length; i++) {
        const { module } = permissions[i];

        // Validate module presence
        if (!module) {
          return Response.customResponse(
            res,
            400,
            ResponseMessage.MODULE_REQUIRED
          );
        }

        // Generate dynamic claims
        const dynamicClaims = [
          { name: `create_${module}` },
          { name: `access_${module}` },
          { name: `delete_${module}` },
        ];

        const newPermission = new Permission({
          module,
          actions: dynamicClaims,
          createdAt: DateUtil.currentDate(),
        });

        const savedPermission = await newPermission.save();
        savedPermissions.push(savedPermission);
      }

      const action = `New ${moduleName}`;
      const person = "ADMINISTRATOR";
      await createActivityLog(moduleName, action, person);

      // Return the savedPermissions directly without wrapping in a "message" key
      return res.status(201).json(savedPermissions);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAll: async (req, res) => {
    try {
      const totalPermissions = await Permission.countDocuments();
      const { pagination, skip } = await PaginationUtiliy.paginationParams(
        req,
        totalPermissions
      );

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      const permissions = await Permission.find()
        .select("-updatedAt -createdAt")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      const permissionData = permissions.map((permission) => ({
        module: permission.module,
        actions: permission.actions,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
        id: permission._id,
      }));

      if (permissionData.length === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      const response = {
        page: pagination.page,
        pages: pagination.pages,
        pageSize: pagination.pageSize,
        rows: totalPermissions,
        data: permissionData,
      };

      return Response.paginationResponse(res, 200, response);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  update: async (req, res) => {
    try {
      const permissions = req.body;

      // Validate request body format
      if (!Array.isArray(permissions)) {
        return Response.customResponse(
          res,
          400,
          ResponseMessage.INVALID_FORMAT
        );
      }

      const savedPermissions = [];
      const existingModules = [];
      let moduleUpdated = "";

      for (let i = 0; i < permissions.length; i++) {
        const { id, module } = permissions[i];

        // Validate permission ID and module presence
        if (!id || !module) {
          return Response.customResponse(
            res,
            400,
            `Invalid format for permission. ID and Module are required at index ${i}.`
          );
        }

        // Find existing permission by ID
        let existingPermission = await Permission.findById(id);

        if (existingPermission) {
          // Update existing permission with new module name
          existingPermission.module = module;
          moduleUpdated = existingPermission._id;

          // Generate dynamic claims based on the module name
          const dynamicClaims = [
            `Create_${module}`,
            `Edit_${module}`,
            `Access_${module}`,
            `Delete_${module}`,
          ];

          // Overwrite existing claims with dynamic claims
          existingPermission.actions = dynamicClaims;
          existingPermission.updatedAt = DateUtil.currentDate();
          existingPermission = await existingPermission.save();
          savedPermissions.push(existingPermission);
        } else {
          existingModules.push({ id, module });
        }
      }

      if (existingModules.length > 0) {
        return res.status(400).json({
          message: ResponseMessage.MODULE_EXISTS,
          existingModules,
        });
      }

      const action = `Updatedd Permission - ${moduleUpdated}`;
      const person = "ADMINISTRATOR";
      await createActivityLog("Permission", action, person);

      // Return the savedPermissions directly without wrapping in a "message" key
      return res.status(200).json(savedPermissions);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id, createdBy } = req.params;
      const permission = await Permission.findById(id);

      if (!permission) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      await permission.deleteOne();

      const action = `Deleted ${moduleName} - ${permission.id}`;
      const person = createdBy;
      await createActivityLog(moduleName, action, person);

      return Response.customResponse(res, 200, ResponseMessage.SUCCESS_MESSAGE);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
};
