// MODELS
const PlantingSchedule = require("../../models/plantingSchedule");

// VALIDATIONS
const {
  plantingScheduleValidation,
} = require("../../validations/plantingSchedule");

// UTILITIES
const Response = require("../../utilities/response_utility");
const date_utility = require("../../utilities/date_utility");
const ResponseMessage = require("../../utilities/messages_utility");
const PaginationUtility = require("../../utilities/pagination_utility");
const { createActivityLog } = require("../../utilities/activitylog_utility");

const moduleName = `PlantingSchedule`;

module.exports = {
  create: async (req, res) => {
    try {
      const plantingScheduleData = req.body;

      const { error } = plantingScheduleValidation(plantingScheduleData);
      if (error) {
        return Response.errorResponse(res, 400, error);
      }

      const newPlantingSchedule = new PlantingSchedule({
        siteName: plantingScheduleData.siteName,
        numberOfTrees: plantingScheduleData.numberOfTrees,
        AssignedBy: plantingScheduleData.AssignedBy,
        responsibleTeam: plantingScheduleData.responsibleTeam,
        note: plantingScheduleData.note,
        createdAt: date_utility.currentDate(),
      });

      const savedPlantingSchedule = await newPlantingSchedule.save();

      const action = `New ${moduleName} created`;
      const person = req.body.AssignedBy;
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(
        res,
        res.statusCode,
        savedPlantingSchedule
      );
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAll: async (req, res) => {
    try {
      const totalPlantingSchedules = await PlantingSchedule.countDocuments();
      const { pagination, skip } = await PaginationUtility.paginationParams(
        req,
        totalPlantingSchedules
      );

      if (pagination.page > pagination.pages) {
        return res.status(200).json({
          message: `Page number ${pagination.page} is greater than the total number of pages that is ${pagination.pages}`,
        });
      }

      pagination.data = await PlantingSchedule.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      pagination.data = pagination.data.map((schedule) => {
        schedule.id = schedule._id.toHexString();
        return schedule;
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

  getById: async (req, res) => {
    try {
      const scheduleId = req.params.id;

      const scheduleData = await PlantingSchedule.findById(scheduleId);
      if (!scheduleData) {
        return Response.errorResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      scheduleData.id = scheduleData._id.toHexString();
      return Response.successResponse(res, res.statusCode, scheduleData);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
  updateById: async (req, res) => {
    const { error } = plantingScheduleValidation(req.body);
    if (error) {
      return Response.errorResponse(res, 400, error.details.map(detail => detail.message).join(', '));
    }

    try {
      const scheduleId = req.params.id;
      const updatedFields = {
        siteName: req.body.siteName,
        numberOfTrees: req.body.numberOfTrees,
        AssignedBy: req.body.AssignedBy,
        responsibleTeam: req.body.responsibleTeam,
        note: req.body.note,
        updatedAt: date_utility.currentDate(),
      };

      const updatedSchedule = await PlantingSchedule.findByIdAndUpdate(
        scheduleId,
        { $set: updatedFields },
        { new: true }
      );

      if (!updatedSchedule) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      const action = `Updated ${moduleName} - ${updatedSchedule._id}`;
      const person = req.body.AssignedBy;
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(res, 200, updatedSchedule);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message);
    }
  },
  


  deleteById: async (req, res) => {
    try {
      const schedule = await PlantingSchedule.findById(req.params.id);

      if (!schedule) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      await schedule.deleteOne();

      const action = `Deleted ${moduleName} - ${schedule._id}`;
      const person = req.param.AssignedBy;
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
};
