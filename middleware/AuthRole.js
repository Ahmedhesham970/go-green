const apiError = require("../utils/ApiError");
function AuthRole() {
  return (req, res, next) => {

    const userRole = req.user.role; 

    if (userRole==='user') {
      return next (new apiError('you are not authorized to access this!',403));
    } else {
      next();
    }
  };
}

module.exports = AuthRole;
