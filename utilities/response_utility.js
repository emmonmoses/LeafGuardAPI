module.exports = {
  sendValidationErrorMessage: async (res, statusCode, error) => {
    return res.status(statusCode).json({
      message: error.message,
    });
  },

  errorResponse: (res, statusCode, error) => {
    return res.status(statusCode).json(
      // message: "Aunauthorised Access: Invalid Token",
      // message: error.message,
      error,
    );
  },

  successResponse: (res, statusCode, model) => {
    return res.status(statusCode).json(model);
  },

  customResponse: (res, statusCode, result) => {
    return res.status(statusCode).json({
      message: result,
    });
  },

  paginationResponse: (res, statusCode, pagination) => {
    return res.status(statusCode).json({
      page: pagination.page,
      pages: pagination.pages,
      pageSize: pagination.pageSize,
      rows: pagination.rows,
      data: pagination.data,
    });
  },
};
