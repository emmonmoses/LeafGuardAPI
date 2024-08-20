const router = require("express").Router();
const { bearerToken } = require("../../authentication/auth");
const roleController = require("../../controllers/version1/role");

router.use(bearerToken);

router.post("/", roleController.create);
router.patch("/", roleController.update);
router.get("/", roleController.getroles);
router.get("/:id", roleController.getRoleById);
router.delete("/:id/:createdBy", roleController.delete);

module.exports = router;
