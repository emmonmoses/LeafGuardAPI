const router = require("express").Router();
const { bearerToken } = require("../../authentication/auth");
const permissionController = require("../../controllers/version1/permission");

router.use(bearerToken);

router.post("/", permissionController.create);
router.get("/", permissionController.getAll);
router.patch("/", permissionController.update);
router.delete("/:id/:createdBy", permissionController.delete);

module.exports = router;
