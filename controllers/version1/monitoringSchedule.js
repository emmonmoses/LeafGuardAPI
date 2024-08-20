const MonitoringSchedule = require('../../models/monitoringSchedule');
const { monitoringScheduleValidation } = require('../../validations/monitoringSchedule');
const Response = require('../../utilities/response_utility');
const ResponseMessage = require('../../utilities/messages_utility');
const PaginationUtility = require('../../utilities/pagination_utility');

module.exports = {
  create: async (req, res) => {
    try {
      const { error } = monitoringScheduleValidation(req.body);
      if (error) {
        return Response.errorResponse(res, 400, error.details.map(detail => detail.message).join(', '));
      }

      const newSchedule = new MonitoringSchedule(req.body);
      const savedSchedule = await newSchedule.save();

      return Response.successResponse(res, 201, savedSchedule);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAll: async (req, res) => {
    try {
      const totalSchedules = await MonitoringSchedule.countDocuments();
      const { pagination, skip } = await PaginationUtility.paginationParams(
        req,
        totalSchedules
      );

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await MonitoringSchedule.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (pagination.data.length === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getById: async (req, res) => {
    try {
      const scheduleId = req.params.id;
      const schedule = await MonitoringSchedule.findById(scheduleId);

      if (!schedule) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      return Response.successResponse(res, 200, schedule);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  updateById: async (req, res) => {
    const { error } = monitoringScheduleValidation(req.body);
    if (error) {
      return Response.errorResponse(res, 400, error.details.map(detail => detail.message).join(', '));
    }

    try {
      const scheduleId = req.params.id;
      const updatedSchedule = await MonitoringSchedule.findByIdAndUpdate(
        scheduleId,
        { ...req.body },
        { new: true }
      );

      if (!updatedSchedule) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      return Response.successResponse(res, 200, updatedSchedule);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  deleteById: async (req, res) => {
    try {
      const scheduleId = req.params.id;
      const deletedSchedule = await MonitoringSchedule.findByIdAndDelete(scheduleId);

      if (!deletedSchedule) {
        return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      return Response.customResponse(res, 200, ResponseMessage.SUCCESS_MESSAGE);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  }
};
