const express = require('express');
const router = express.Router();
const monitoringScheduleController = require('../../controllers/version1/monitoringSchedule');
const { bearerToken } = require("../../authentication/auth");

router.use(bearerToken);

router.post('/', monitoringScheduleController.create);
router.get('/', monitoringScheduleController.getAll);
router.get('/:id', monitoringScheduleController.getById);
router.put('/:id', monitoringScheduleController.updateById);
router.delete('/:id', monitoringScheduleController.deleteById);

module.exports = router;
