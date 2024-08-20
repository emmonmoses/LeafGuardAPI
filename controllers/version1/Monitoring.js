const Monitoring = require("../../models/Monitoring");
const { monitoringValidation } = require("../../validations/Monitoring");
const Response = require("../../utilities/response_utility");
const dateUtility = require("../../utilities/date_utility");
const ResponseMessage = require("../../utilities/messages_utility");
const PaginationUtility = require("../../utilities/pagination_utility");
const { createActivityLog } = require("../../utilities/activitylog_utility");

const moduleName = "monitoring";

module.exports = {
  createOrUpdate: async (req, res) => {
    try {
      const monitoringData = req.body;

      const { error } = monitoringValidation(monitoringData);
      if (error) {
        return Response.errorResponse(
          res,
          400,
          error.details.map((detail) => detail.message).join(", ")
        );
      }

      // Check if an existing record matches the query conditions
      let existingMonitoring = await Monitoring.findOne({
        name: monitoringData.name,
        kabale: monitoringData.kabale,
        houseNumber: monitoringData.houseNumber,
        phoneNumber: monitoringData.phoneNumber,
      });

      if (existingMonitoring) {
        // Create a new record instead of updating the existing one
        const newMonitoring = new Monitoring({
          ...monitoringData,
          createdAt: dateUtility.currentDate(),
        });

        const savedMonitoring = await newMonitoring.save();
        const action = `New ${moduleName}`;
        const person = monitoringData.name;
        await createActivityLog(moduleName, action, person);
        return Response.successResponse(res, 201, savedMonitoring);
      } else {
        const newMonitoring = new Monitoring({
          ...monitoringData,
          createdAt: dateUtility.currentDate(),
        });

        const savedMonitoring = await newMonitoring.save();
        const action = `New ${moduleName}`;
        const person = monitoringData.name;
        await createActivityLog(moduleName, action, person);
        return Response.successResponse(res, 201, savedMonitoring);
      }
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAllMonitorings: async (req, res) => {
    try {
      const totalMonitorings = await Monitoring.countDocuments();
      const { pagination, skip } = await PaginationUtility.paginationParams(
        req,
        totalMonitorings
      );

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Monitoring.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      pagination.data = pagination.data.map((item) => ({
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

  getMonitoringById: async (req, res) => {
    try {
      const monitoringId = req.params.id;
      const monitoringData = await Monitoring.findById(monitoringId);

      if (!monitoringData) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      return Response.successResponse(res, 200, monitoringData);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  update: async (req, res) => {
    try {
      const monitoringId = req.params.id;
      const monitoringData = req.body;

      const { error } = monitoringValidation(monitoringData);
      if (error) {
        return Response.errorResponse(
          res,
          400,
          error.details.map((detail) => detail.message).join(", ")
        );
      }

      const updatedMonitoring = await Monitoring.findByIdAndUpdate(
        monitoringId,
        {
          ...monitoringData,
          updatedAt: dateUtility.currentDate(),
        },
        { new: true }
      );

      if (!updatedMonitoring) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      const action = `Update ${moduleName}`;
      const person = monitoringData.name;
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(res, 200, updatedMonitoring);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  delete: async (req, res) => {
    try {
      const monitoringId = req.params.id;
      const deletedMonitoring = await Monitoring.findByIdAndDelete(
        monitoringId
      );

      if (!deletedMonitoring) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      const action = `Delete ${moduleName}`;
      const person = deletedMonitoring.name;
      await createActivityLog(moduleName, action, person);

      return Response.customResponse(res, 200, ResponseMessage.SUCCESS_MESSAGE);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
};
