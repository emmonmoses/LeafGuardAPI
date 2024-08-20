const Organisation = require("../../models/organisation");
const { organisationValidation } = require("../../validations/organisation");
const Response = require("../../utilities/response_utility");
const dateUtility = require("../../utilities/date_utility");
const ResponseMessage = require("../../utilities/messages_utility");
const PaginationUtility = require("../../utilities/pagination_utility");
const { createActivityLog } = require("../../utilities/activitylog_utility");

const moduleName = "organisation";

module.exports = {
  create: async (req, res) => {
    try {
      const registrationData = req.body;

      const { error } = organisationValidation(registrationData);
      if (error) {
        return Response.errorResponse(
          res,
          400,
          error.details.map((detail) => detail.message).join(", ")
        );
      }

      const newRegistration = new Organisation(registrationData);
      const savedRegistration = await newRegistration.save();

      const action = `New ${moduleName}`;
      const organisationName = registrationData.organisationName;
      await createActivityLog(moduleName, action, organisationName);

      return Response.successResponse(res, 201, savedRegistration);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAllOrganisations: async (req, res) => {
    try {
      const query = { type: "organisation" }; // Filter to only get documents with type "organisation"
      const totalRegistrations = await Organisation.countDocuments(query);
      const { pagination, skip } = await PaginationUtility.paginationParams(
        req,
        totalRegistrations
      );

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Organisation.find(query)
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

  getOrganisationById: async (req, res) => {
    try {
      const organisationId = req.params.id;
      const organisationData = await Organisation.findOne({
        _id: organisationId,
        type: "organisation",
      });

      if (!organisationData) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      return Response.successResponse(res, 200, organisationData);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  update: async (req, res) => {
    try {
      const organisationId = req.params.id;
      const organisationData = req.body;

      // Validate the incoming data
      const { error } = organisationValidation(organisationData);
      if (error) {
        return Response.errorResponse(
          res,
          400,
          error.details.map((detail) => detail.message).join(", ")
        );
      }

      // Update the organisation document only if the type is "organisation"
      const updatedOrganisation = await Organisation.findOneAndUpdate(
        { _id: organisationId, type: "organisation" },
        { ...organisationData, updatedAt: dateUtility.currentDate() },
        { new: true }
      );

      // Check if the organisation document was found and updated
      if (!updatedOrganisation) {
        return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      // Log the update activity
      const action = `Update ${moduleName}`;
      const organisationName = organisationData.organisationName;
      await createActivityLog(moduleName, action, organisationName);

      // Return success response with updated organisation data
      return Response.successResponse(res, 200, updatedOrganisation);
    } catch (err) {
      // Handle unexpected errors
      return Response.errorResponse(res, 500, err);
    }
  },

  delete: async (req, res) => {
    try {
      const organisationId = req.params.id;
  
      // Delete the organisation document only if the type is "organisation"
      const deletedOrganisation = await Organisation.findOneAndDelete({
        _id: organisationId,
        type: "organisation",
      });
  
      if (!deletedOrganisation) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }
  
      const action = `Delete ${moduleName}`;
      const organisationName = deletedOrganisation.organisationName;
      await createActivityLog(moduleName, action, organisationName);
  
      return Response.customResponse(res, 200, ResponseMessage.SUCCESS_MESSAGE);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
  
};
