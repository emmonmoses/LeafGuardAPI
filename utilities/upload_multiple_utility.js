const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Upload = require("../models/upload");
const ResponseMessage = require("../utilities/messages_utility");
const Response = require("../utilities/response_utility");

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
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

const uploadGallery = (folderpath) => {
  return async (req, res, next) => {
    req.destination = `${folderpath}${req.params.code}`;
    upload(req.destination).array("gallery", 5)(req, res, next);
  };
};

const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return Response.errorResponse(
        res,
        400,
        ResponseMessage.FILE_UPLOAD_ERROR
      );
    }

    const galleryNames = req.files.map((file) => file.filename);

    // Create image objects
    const images = galleryNames.map((name) => new Upload({ name }));

    const newImages = await Upload.insertMany(images);

    const responseImages = {
      gallery: newImages.map((image) => image.name),
    };

    return Response.successResponse(res, res.statusCode, responseImages);
  } catch (err) {
    if (err.code === 11000) {
      return Response.errorResponse(res, 409, err);
    } else {
      return Response.errorResponse(res, 500, err);
    }
  }
};

const getImages = (folderpath) => {
  return async (req, res) => {
    try {
      const imageName = req.params.name;
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
        default:
          contentType = "application/octet-stream";
      }

      res.setHeader("Content-Type", contentType);

      const stream = fs.createReadStream(imagePath);
      stream.pipe(res);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  };
};

module.exports = { uploadGallery, uploadImages, getImages };
