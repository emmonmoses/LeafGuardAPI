const express = require("express");
const router = express.Router();
const organisationController = require("../../controllers/version1/organisation");

router.post("/", organisationController.create);
router.get("/", organisationController.getAllOrganisations);
router.get("/:id", organisationController.getOrganisationById);
router.put("/:id", organisationController.update);
router.delete("/:id", organisationController.delete);

module.exports = router;
