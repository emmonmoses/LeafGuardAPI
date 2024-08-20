const express = require("express");
const router = express.Router();
const treeReceptionController = require("../../controllers/version1/treereception");
const { bearerToken } = require("../../authentication/auth");

router.use(bearerToken);

router.post("/", treeReceptionController.create);
router.get("/", treeReceptionController.getAllTreeReceptions);
router.get("/:id", treeReceptionController.getTreeReceptionById);
router.put("/:id", treeReceptionController.update);
router.delete("/:id", treeReceptionController.delete);

module.exports = router;
