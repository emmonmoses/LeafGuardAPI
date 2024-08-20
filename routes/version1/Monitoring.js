const express = require('express');
const router = express.Router();
const monitoringController = require("../../controllers/version1/Monitoring");
const { bearerToken } = require("../../authentication/auth");

router.use(bearerToken);

router.post("/", monitoringController.createOrUpdate);
router.get("/", monitoringController.getAllMonitorings);
router.get("/:id", monitoringController.getMonitoringById);
router.put("/:id", monitoringController.update);
router.delete("/:id", monitoringController.delete);

module.exports = router;
