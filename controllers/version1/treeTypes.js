const TreeType = require("../../models/treeTypes");
const { treeTypeValidation } = require("../../validations/treeTypes");
const Response = require("../../utilities/response_utility");
const PaginationUtility = require("../../utilities/pagination_utility");
const dateUtility = require("../../utilities/date_utility");
const ResponseMessage = require("../../utilities/messages_utility");

const moduleName = "treeType";

// Helper function to generate the next sequential code
const generateNextCode = async (prefix) => {
  // Find the latest code for the given prefix
  const latestTreeType = await TreeType.findOne().sort({ code: -1 }).exec();
  
  if (!latestTreeType) {
    return `${prefix}${new Date().getFullYear()}01`; // Starting code if none exist
  }

  const latestCode = latestTreeType.code;
  const latestYear = parseInt(latestCode.substring(2, 6), 10);
  const latestNumber = parseInt(latestCode.substring(6), 10);

  const currentYear = new Date().getFullYear();
  const newNumber = (latestYear === currentYear) ? (latestNumber + 1) : 1;

  return `${prefix}${currentYear}${newNumber.toString().padStart(2, '0')}`;
};

module.exports = {
  create: async (req, res) => {
    try {
      const treeTypeData = req.body;

      const { error } = treeTypeValidation(treeTypeData);
      if (error) {
        return Response.errorResponse(res, 400, error.details.map(detail => detail.message).join(", "));
      }

      const codePrefix = treeTypeData.name.substring(0, 2).toUpperCase();
      const newCode = await generateNextCode(codePrefix);

      const newTreeType = new TreeType({
        ...treeTypeData,
        code: newCode,
        createdAt: dateUtility.currentDate(),
      });

      const savedTreeType = await newTreeType.save();

      return Response.successResponse(res, 201, savedTreeType);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAllTreeTypes: async (req, res) => {
    try {
      const totalTreeTypes = await TreeType.countDocuments();
      const { pagination, skip } = await PaginationUtility.paginationParams(req, totalTreeTypes);

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await TreeType.find()
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

  getTreeTypeById: async (req, res) => {
    try {
      const treeTypeId = req.params.id;
      const treeTypeData = await TreeType.findById(treeTypeId);

      if (!treeTypeData) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      return Response.successResponse(res, 200, treeTypeData);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  update: async (req, res) => {
    try {
      const treeTypeId = req.params.id;
      const treeTypeData = req.body;

      // Validate the incoming data
      const { error } = treeTypeValidation(treeTypeData);
      if (error) {
        return Response.errorResponse(res, 400, error.details.map(detail => detail.message).join(", "));
      }

      // Fetch the existing treeType to determine if the name has changed
      const existingTreeType = await TreeType.findById(treeTypeId);
      if (!existingTreeType) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      // Determine if the name has changed
      let updatedData = { ...treeTypeData, updatedAt: dateUtility.currentDate() };

      if (treeTypeData.name && treeTypeData.name !== existingTreeType.name) {
        const prefix = treeTypeData.name.substring(0, 2).toUpperCase();
        const newCode = await generateNextCode(prefix); // Function to generate next code
        updatedData.code = newCode;
      } else {
        updatedData.code = existingTreeType.code; // Preserve the existing code if the name hasn't changed
      }

      // Update the treeType document
      const updatedTreeType = await TreeType.findByIdAndUpdate(
        treeTypeId,
        updatedData,
        { new: true }
      );

      if (!updatedTreeType) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      return Response.successResponse(res, 200, updatedTreeType);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
  
  delete: async (req, res) => {
    try {
      const treeTypeId = req.params.id;
      const deletedTreeType = await TreeType.findByIdAndDelete(treeTypeId);

      if (!deletedTreeType) {
        return Response.customResponse(res, 404, ResponseMessage.NO_DATA);
      }

      return Response.customResponse(res, 200, ResponseMessage.SUCCESS_MESSAGE);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
};
