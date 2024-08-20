const TreeReception = require("../../models/treeReception");
const { treereceptionValidation } = require("../../validations/treeReception");
const Response = require("../../utilities/response_utility");
const dateUtility = require("../../utilities/date_utility");
const ResponseMessage = require("../../utilities/messages_utility");
const PaginationUtility = require("../../utilities/pagination_utility");
const { createActivityLog } = require("../../utilities/activitylog_utility");

const moduleName = "treeReception";

module.exports = {
  create: async (req, res) => {
    try {
      const treereceptionData = req.body;

      const { error } = treereceptionValidation(treereceptionData);

      if (error) {
        return Response.errorResponse(res, 400, error.details.map(detail => detail.message).join(", "));
      }

      const newTreeReception = new TreeReception({
        ...treereceptionData,
        createdAt: dateUtility.currentDate(),
      });

      const savedTreeReception = await newTreeReception.save();

      const action = `New ${moduleName}`;
      const person = treereceptionData.receivedBy;
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(res, 201, savedTreeReception);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAllTreeReceptions: async (req, res) => {
    try {
      const totalTreeReceptions = await TreeReception.countDocuments();
      const { pagination, skip } = await PaginationUtility.paginationParams(req, totalTreeReceptions);

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await TreeReception.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      pagination.data = pagination.data.map(item => ({
        ...item.toJSON(),
      }));

      if (pagination.data.length === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getTreeReceptionById: async (req, res) => {
    try {
      const treeReceptionId = req.params.id;
      const treeReceptionData = await TreeReception.findById(treeReceptionId);

      if (!treeReceptionData) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      return Response.successResponse(res, 200, treeReceptionData);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  update: async (req, res) => {
    try {
      const treeReceptionId = req.params.id;
      const treereceptionData = req.body;

      const { error } = treereceptionValidation(treereceptionData);
      if (error) {
        return Response.errorResponse(res, 400, error.details.map(detail => detail.message).join(", "));
      }

      const updatedTreeReception = await TreeReception.findByIdAndUpdate(
        treeReceptionId,
        { ...treereceptionData, updatedAt: dateUtility.currentDate() },
        { new: true }
      );

      if (!updatedTreeReception) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      const action = `Update ${moduleName}`;
      const person = treereceptionData.receivedBy;
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(res, 200, updatedTreeReception);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  delete: async (req, res) => {
    try {
      const treeReceptionId = req.params.id;
      const deletedTreeReception = await TreeReception.findByIdAndDelete(treeReceptionId);

      if (!deletedTreeReception) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      const action = `Delete ${moduleName}`;
      const person = deletedTreeReception.receivedBy;
      await createActivityLog(moduleName, action, person);

      return Response.customResponse(res, 200, ResponseMessage.SUCCESS_MESSAGE);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
};
