// controllers/version1/status.js
const Status = require("../../models/status");
const { statusValidation } = require("../../validations/status");
const Response = require("../../utilities/response_utility");
const dateUtility = require("../../utilities/date_utility");
const ResponseMessage = require("../../utilities/messages_utility");
const PaginationUtility = require("../../utilities/pagination_utility");
const { createActivityLog } = require("../../utilities/activitylog_utility");

const moduleName = "status";

module.exports = {
  create: async (req, res) => {
    try {
      const statusData = req.body;

      const { error } = statusValidation(statusData);

      if (error) {
        return Response.errorResponse(res, 400, error.details.map(detail => detail.message).join(", "));
      }

      const newStatus = new Status({
        ...statusData,
        createdAt: dateUtility.currentDate(),
      });

      const savedStatus = await newStatus.save();

      const action = `New ${moduleName}`;
      const person = statusData.createdBy; // Assuming you have createdBy field in statusData
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(res, 201, savedStatus);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAllStatuses: async (req, res) => {
    try {
      const totalStatuses = await Status.countDocuments();
      const { pagination, skip } = await PaginationUtility.paginationParams(req, totalStatuses);

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Status.find()
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

  getStatusById: async (req, res) => {
    try {
      const statusId = req.params.id;
      const statusData = await Status.findById(statusId);

      if (!statusData) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      return Response.successResponse(res, 200, statusData);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  update: async (req, res) => {
    try {
      const statusId = req.params.id;
      const statusData = req.body;

      const { error } = statusValidation(statusData);
      if (error) {
        return Response.errorResponse(res, 400, error.details.map(detail => detail.message).join(", "));
      }

      const updatedStatus = await Status.findByIdAndUpdate(
        statusId,
        { ...statusData, updatedAt: dateUtility.currentDate() },
        { new: true }
      );

      if (!updatedStatus) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      const action = `Update ${moduleName}`;
      const person = statusData.updatedBy; // Assuming you have updatedBy field in statusData
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(res, 200, updatedStatus);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  delete: async (req, res) => {
    try {
      const statusId = req.params.id;
      const deletedStatus = await Status.findByIdAndDelete(statusId);

      if (!deletedStatus) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      const action = `Delete ${moduleName}`;
      const person = deletedStatus.deletedBy; // Assuming you have deletedBy field in deletedStatus
      await createActivityLog(moduleName, action, person);

      return Response.customResponse(res, 200, ResponseMessage.SUCCESS_MESSAGE);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
};
