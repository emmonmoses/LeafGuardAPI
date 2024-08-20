// routes/version1/status.js
const express = require("express");
const router = express.Router();
const statusController = require("../../controllers/version1/status");
const { bearerToken } = require("../../authentication/auth");

router.use(bearerToken);

router.post("/", statusController.create);
router.get("/", statusController.getAllStatuses);
router.get("/:id", statusController.getStatusById);
router.put("/:id", statusController.update);
router.delete("/:id", statusController.delete);

module.exports = router;
