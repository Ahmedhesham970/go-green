const express = require("express");
const router = express.Router();
const apiError = require("../utils/ApiError");
const authRole = require("../middleware/AuthRole");
const machine = require("../controllers/machineController");
const auth = require("../middleware/verifyToken");

router.get("/findMachine",auth.auth, machine.findNearbyMachine);
router.post("/addMachine",auth.auth,authRole(), machine.addNewMachine);

module.exports = router;
