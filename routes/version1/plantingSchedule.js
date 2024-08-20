const express = require('express');
const router = express.Router();
const plantingScheduleController = require('../../controllers/version1/plantingSchedule');
const { bearerToken } = require("../../authentication/auth");

router.use(bearerToken);

router.post('/', plantingScheduleController.create);
router.get('/', plantingScheduleController.getAll);
router.get('/:id', plantingScheduleController.getById);
router.put('/:id', plantingScheduleController.updateById);
router.delete('/:id', plantingScheduleController.deleteById);

module.exports = router;
