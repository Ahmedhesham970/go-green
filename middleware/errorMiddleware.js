const apiError = require("../utils/ApiError");

module.exports = (err, req, res, next) => {
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    errorInDev(res, err);
    next();
  } else {
    errorInProd(res, err);
  }
};

const errorInDev = (res, err) => {
  return res.status(err.statusCode||500).send({
    status: err.status,
    error: err.message,
    stack: err.stack,
  });
};

const errorInProd = (res, err) => {
  return res.status(err.statusCode||500).send({
    status: err.status,
    error: err.message,
  });
};
