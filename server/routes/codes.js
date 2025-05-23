const express = require("express");
const codesController = require("../controllers/codesController");
const router = express.Router();

router.post("/generate", codesController.generateCodes);
router.post("/verify", codesController.verifyCode);
router.get("/", codesController.getAllCodes);

module.exports = router;
