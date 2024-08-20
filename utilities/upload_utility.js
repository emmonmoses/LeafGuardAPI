const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Upload = require("../models/upload");
const ResponseMessage = require("../utilities/messages_utility");
const Response = require("../utilities/response_utility");

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  } else {
  }
};

const getStorage = (destination) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const originalName = file.originalname;
      cb(null, originalName);
    },
  });
};

const upload = (destination) => {
  createFolder(destination);
  const storage = getStorage(destination);
  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const originalName = file.originalname;
      const filePath = `${destination}/${originalName}`;

      // Check if the file with the same name already exists
      fs.access(filePath, (err) => {
        if (!err) {
          const error = new Error("Duplicate file upload is not allowed");
          error.statusCode = 409;
          cb(error);
        } else {
          cb(null, true);
        }
      });
    },
  });
};

const uploadAvatar = (folderpath) => {
  return async (req, res, next) => {
    req.destination = `${folderpath}${req.params.code}`;
    upload(req.destination).single("avatar")(req, res, next);
  };
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return Response.errorResponse(
        res,
        400,
        ResponseMessage.FILE_UPLOAD_ERROR
      );
    }

    const logoFilename = req.file ? req.file.filename : "default.png";

    // Create image object
    const image = new Upload({
      name: logoFilename,
    });

    const newImage = await image.save();

    const responseImage = {
      name: newImage.name,
    };

    return Response.successResponse(res, res.statusCode, responseImage);
  } catch (err) {
    if (err.code === 11000) {
      return Response.errorResponse(res, 409, err);
    } else {
      return Response.errorResponse(res, 500, err);
    }
  }
};

const getImage = (folderpath) => {
  return async (req, res) => {
    try {
      const imageName = req.params.avatar;
      const folderCode = req.params.code;
      const imagePath = path.join(
        __dirname,
        `../${folderpath}${folderCode}`,
        imageName
      );

      // Check if the image file exists
      if (!fs.existsSync(imagePath)) {
        return Response.customResponse(res, 404, ResponseMessage.NO_IMAGE);
      }

      // Extract file extension
      const extension = path.extname(imageName).toLowerCase();

      // Set the content type based on the file extension
      let contentType = "";
      switch (extension) {
        case ".jpg":
        case ".jpeg":
          contentType = "image/jpeg";
          break;
        case ".png":
          contentType = "image/png";
          break;
        // Add more cases for other supported image formats if needed
        default:
          contentType = "application/octet-stream"; // Fallback content type
      }

      // Set the content type in the response headers
      res.setHeader("Content-Type", contentType);

      // Read and stream the image file
      const stream = fs.createReadStream(imagePath);
      stream.pipe(res);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  };
};

module.exports = { uploadAvatar, uploadImage, getImage };
