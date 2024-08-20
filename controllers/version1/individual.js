const Individual = require("../../models/individual");
const { individualValidation } = require("../../validations/individual");
const Response = require("../../utilities/response_utility");
const dateUtility = require("../../utilities/date_utility");
const ResponseMessage = require("../../utilities/messages_utility");
const PaginationUtility = require("../../utilities/pagination_utility");
const { createActivityLog } = require("../../utilities/activitylog_utility");

const moduleName = "individual";

module.exports = {
  create: async (req, res) => {
    try {
      const registrationData = req.body;

      const { error } = individualValidation(registrationData);
      if (error) {
        return Response.errorResponse(
          res,
          400,
          error.details.map((detail) => detail.message).join(", ")
        );
      }

      const newRegistration = new Individual(registrationData);
      const savedRegistration = await newRegistration.save();

      const action = `New ${moduleName}`;
      const person = registrationData.fullName;
      await createActivityLog(moduleName, action, person);

      return Response.successResponse(res, 201, savedRegistration);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAllIndividuals: async (req, res) => {
    try {
      // Count the documents where type is "individual"
      const totalRegistrations = await Individual.countDocuments({
        type: "individual",
      });
      const { pagination, skip } = await PaginationUtility.paginationParams(
        req,
        totalRegistrations
      );

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      // Find the documents where type is "individual"
      pagination.data = await Individual.find({ type: "individual" })
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

  getIndividualById: async (req, res) => {
    try {
      const individualId = req.params.id;
      const individualData = await Individual.findOne({
        _id: individualId,
        type: "individual",
      });

      if (!individualData) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      return Response.successResponse(res, 200, individualData);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  update: async (req, res) => {
    try {
      const individualId = req.params.id;
      const individualData = req.body;

      // Validate the incoming data
      const { error } = individualValidation(individualData);
      if (error) {
        return Response.errorResponse(
          res,
          400,
          error.details.map((detail) => detail.message).join(", ")
        );
      }

      // Update the individual document
      const updatedIndividual = await Individual.findOneAndUpdate(
        { _id: individualId, type: "individual" },
        { ...individualData, updatedAt: dateUtility.currentDate() },
        { new: true }
      );

      // Check if the individual document was found and updated
      if (!updatedIndividual) {
        return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      // Log the update activity
      const action = `Update ${moduleName}`;
      const person = individualData.fullName;
      await createActivityLog(moduleName, action, person);

      // Return success response with updated individual data
      return Response.successResponse(res, 200, updatedIndividual);
    } catch (err) {
      // Handle unexpected errors
      return Response.errorResponse(res, 500, err);
    }
  },

  delete: async (req, res) => {
    try {
      const individualId = req.params.id;
      const deletedIndividual = await Individual.findOneAndDelete({
        _id: individualId,
        type: "individual",
      });

      if (!deletedIndividual) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      const action = `Delete ${moduleName}`;
      const person = deletedIndividual.fullName;
      await createActivityLog(moduleName, action, person);

      return Response.customResponse(res, 200, ResponseMessage.SUCCESS_MESSAGE);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
};
