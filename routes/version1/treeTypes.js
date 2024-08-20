const express = require("express");
const router = express.Router();
const treeTypeController = require("../../controllers/version1/treeTypes");

// Define routes for TreeType
router.post("/", treeTypeController.create);
router.get("/", treeTypeController.getAllTreeTypes);
router.get("/:id", treeTypeController.getTreeTypeById);
router.put("/:id", treeTypeController.update);
router.delete("/:id", treeTypeController.delete);

module.exports = router;
