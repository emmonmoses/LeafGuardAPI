const express = require("express");
const router = express.Router();
const individualController = require("../../controllers/version1/individual");

router.post("/", individualController.create);
router.get("/", individualController.getAllIndividuals);
router.get("/:id", individualController.getIndividualById);
router.put("/:id", individualController.update);
router.delete("/:id", individualController.delete);

module.exports = router;
