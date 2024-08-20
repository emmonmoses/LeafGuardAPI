const express = require("express");
const router = express.Router();
const treeReceptionController = require("../../controllers/version1/treereception");

router.post("/", treeReceptionController.create);
router.get("/", treeReceptionController.getAllTreeReceptions);
router.get("/:id", treeReceptionController.getTreeReceptionById);
router.put("/:id", treeReceptionController.update);
router.delete("/:id", treeReceptionController.delete);

module.exports = router;
