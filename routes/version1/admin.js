const router = require('express').Router();
const { bearerToken } = require("../../authentication/auth");
const uploadUtility = require("../../utilities/upload_utility");
const administratorController = require("../../controllers/version1/admin");

let destination = `uploads/systemusers/`;

router.post("/login", administratorController.login);
router.patch("/forgot/password", administratorController.resetPassword);
router.get("/image/:code/:avatar", uploadUtility.getImage(destination));
router.post(
  "/upload/:code",
  uploadUtility.uploadAvatar(destination),
  uploadUtility.uploadImage
);

router.use(bearerToken);

router.post("/", administratorController.createAdministrator);
router.get("/", administratorController.getAdministrators);
router.get("/:id", administratorController.getAdministrator);
router.patch("/", administratorController.updateAdministrator);
router.delete("/:id/:userId", administratorController.deleteAdministrator);
router.patch("/change/password", administratorController.changePassword);
router.get("/role/:id", administratorController.getUsersByRole);

module.exports = router;

