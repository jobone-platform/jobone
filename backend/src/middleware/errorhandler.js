import constants from "./constants.js";

const errorHandler = (err, req, res, next) => {
 if (res.headersSent) {
    return next(err);
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    title: getErrorTitle(statusCode),
    message: err.message || "Something went wrong",
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
