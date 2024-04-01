const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  const msg = errors.array();
  if (!errors.isEmpty()) return res.status(400).send({ error: msg });
  next();
};
