import constants from "./constants.js";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Something went wrong";

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const duplicateFields = Object.keys(err.keyPattern || err.keyValue || {});
    const fieldName = duplicateFields[0] || "field";
    const readableField = fieldName === "phone" ? "Phone number" : fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    message = `${readableField} is already registered. Please use another one or log in.`;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    const firstError = Object.values(err.errors || {})[0];
    message = firstError?.message || "Validation failed";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format for resource: ${err.value}`;
  }

  res.status(statusCode).json({
    title: getErrorTitle(statusCode),
    message,
    stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

const getErrorTitle = (code) => {
  switch (code) {
    case constants.VALIDATION_ERROR:
      return "Validation Failed";
    case constants.NOT_FOUND:
      return "Not Found";
    case constants.FORBIDDEN:
      return "Forbidden";
    case constants.UNAUTHORIZED:
      return "Unauthorized";
    case constants.INTERNAL_SERVER_ERROR:
      return "Internal Server Error";
    default:
      return "Error"; // <--- important
  }
};

export default errorHandler;
