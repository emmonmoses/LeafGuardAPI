const Role = require("../../models/role");
const Administrator = require("../../models/admin");
const SubAdministrator = require("../models/admin");

const Permission = require("../models/permissions");
const Pagination = require("../models/pagination");

const { sign } = require("jsonwebtoken");
const { genSaltSync, hashSync, compareSync } = require("bcryptjs");
const bcrypt = require("bcryptjs");

const { loginValidation } = require("../validations/login_validation");
const {
  administratorValidation,
} = require("../validations/administrator_validation");

const moment = require("moment-timezone");
require("moment");

const randomUniqueID = () => {
  const characters = "0123456789";
  let uniqueId = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters.charAt(randomIndex);
  }
  return uniqueId;
};

const { sendEmail } = require("../mailer/nodemailer");

const capitalizeFirstLetters = (str) => {
  return str.replace(/\b\w/g, (match) => match.toUpperCase());
};

module.exports = {
  login: async (req, res) => {
    const { error } = loginValidation(req.body);

    if (error) {
      return res.status(400).json({
        status: 0,
        message: "ValidationError",
        details: error.message,
      });
    }

    // CHECK IF ADMIN EXISTS
    const body = req.body;
    const administrator = await SubAdministrator.findOne({ email: body.email });

    if (!administrator) {
      return res.status(404).json({
        status: 0,
        message: "Invalid Email",
        details: "The email provided is not valid",
      });
    }

    // CHECK PASSWORD IS CORRECT
    const validPassword = compareSync(body.password, administrator.password);

    if (!validPassword)
      return res.status(400).json({
        status: 0,
        message: "Invalid Password",
        details: "The password provided is not valid",
      });

    administrator.password = undefined;
    const jsontoken = sign({ key: administrator }, process.env.JWK_SECRET, {
      expiresIn: process.env.JWK_EXPIRATION,
    });

    // GET ALL THE MODULE PERMISSIONS FOR ADMIN
    const allRoles = await Permission.find({ isCompany: { $in: [0, 2] } });

    // GET THE USER PERMISSIONS FOR ANY OTHER USER OTHER THAN THE ADMIN
    // const roles = await Permission.find({ subAdminId: administrator._id });

    // if (roles.length == 0) {
    //   return res.status(404).json({
    //     message: "No Module Permission Assigned to this user",
    //   });
    // }

    return res.status(res.statusCode).json({
      status: 1,
      id: administrator._id,
      admin: administrator.adminNumber,
      name: administrator.name,
      username: administrator.username,
      email: administrator.email,
      avatar: administrator.avatar,
      role: administrator.role,
      permissions:
        administrator.role == "subadmin" ? administrator.permissions : allRoles,
      // permissions: roles,
      token: jsontoken,
      created: administrator.createdAt,
    });
  },

  changePassword: async (req, res) => {
    try {
      const adminId = req.body.administratorId;
      const admin = await Administrator.findById(adminId);

      console.log(admin);
      console.log(adminId);

      if (!admin) {
        return res.status(404).json({
          message: "Admin not found",
        });
      }

      if (
        req.body.oldPassword &&
        req.body.newPassword &&
        req.body.confirmPassword
      ) {
        // Check if the old password matches the current password
        const isPasswordValid = bcrypt.compareSync(
          req.body.oldPassword,
          admin.password
        );
        if (!isPasswordValid) {
          return res.status(400).json({
            message: "Old password is incorrect",
          });
        }

        // Validate the new password and confirm password
        if (req.body.newPassword !== req.body.confirmPassword) {
          return res.status(400).json({
            message: "New password and confirm password do not match",
          });
        }

        // Hash the new password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);
        admin.password = hashedPassword;
      }

      admin.actionDate = Date.now();

      await admin.save();

      return res.status(res.statusCode).json({
        message: "Password Changed Successfully",
      });
    } catch (err) {
      return res.status(400).json({
        message: err.message,
      });
    }
  },

  resetPassword: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await Administrator.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: `${email} is not found` });
      }

      const resetPassword = randomPassword();
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(resetPassword, salt);
      user.password = hashedPassword;

      await user.save();

      const emailSubject = "Administrator Reset Password".toUpperCase();

      const emailText = `Hi ${capitalizeFirstLetters(user.name)}, <br><br>
      Your password has been reset to <strong>${resetPassword}</strong>. Kindly ensure you change your password after sign in.<br><br>
      Best Regards <br> OneStop Support Team <br><br>
      <a href="http://etonestop.com" target="_blank">
      <img src="http://etonestop.com/logo.png" alt="OneStop Logo" style="width: 150px; height: auto;">
      </a><br>
      &copy; ${new Date().getFullYear()} All rights reserved.`;

      sendEmail(email, emailSubject, emailText);

      res.status(200).json({
        message: "In case there is an account associated with this email address, a verification code will be sent by email!",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  
  createAdministrator: async (req, res) => {
    try {
      // Validate administrator input
      const { error } = administratorValidation(req.body);
      if (error) {
        return res.status(400).json({
          status: 0,
          code: "ValidationError",
          message: `${error.message}`,
        });
      }

      // Check if email or username already exists
      const existingEmail = await Administrator.findOne({
        email: req.body.email,
      });

      if (existingEmail) {
        return res.status(409).json({
          message: "Email already exists.",
        });
      }

      const existingUsername = await Administrator.findOne({
        username: req.body.username,
      });

      if (existingUsername) {
        return res.status(409).json({
          message: "Username already exists.",
        });
      }

      // Hash the password
      const salt = genSaltSync(8);
      const hashedPassword = hashSync(req.body.password, salt);

      // Generate a random adminId
      const uniqueId = randomUniqueID();

      // Create administrator object
      const administrator = new Administrator({
        adminNumber: "AD" + uniqueId,
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: "admin",
        usertype: "0",
        status: req.body.status,
      });

      // Save administrator
      const newAdministrator = await administrator.save();

      return res.status(201).json({
        status: 1,
        newAdministrator,
      });
    } catch (err) {
      return res.status(400).json({
        status: 0,
        message: err.message,
      });
    }
  },

  getAdministrators: async (req, res) => {
    try {
      const pagination = new Pagination({});
      const totalAdministrators = await Administrator.countDocuments({
        role: "admin",
        usertype: 0,
      });

      pagination.page = parseInt(req.query.page); // Get the current page number
      pagination.pageSize = parseInt(req.query.pageSize) || 10; // Get the page size, default to 10 if not provided
      pagination.rows = totalAdministrators; // Get the total number of administrators

      const skip = (pagination.page - 1) * pagination.pageSize; // Calculate the number of documents to skip
      pagination.pages = Math.ceil(totalAdministrators / pagination.pageSize); // Calculate the total number of pages

      if (pagination.page > pagination.pages) {
        return res.status(200).json({
          message: `No Data Found`,
        });
      }

      pagination.data = await Administrator.find({
        role: "admin",
        usertype: 0,
      })
        // .select('-password')
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (pagination.data.length === 0) {
        return res.status(res.statusCode).json({
          status: 0,
          message: "There are no administrator records",
          data: pagination.data,
        });
      }

      return res.status(res.statusCode).json({
        status: 1,
        page: pagination.page,
        pages: pagination.pages,
        pageSize: pagination.pageSize,
        rows: pagination.rows,
        data: pagination.data,
      });
    } catch (err) {
      return res.status(500).json({
        status: 0,
        message: err.message,
      });
    }
  }, 

  getUsersByRole: async (req, res) => {
    try {
      const role = await Role.findById(req.params.id);

      if (!role) {
        return Response.customResponse(res, 404, ResponseMessage.NO_RECORD);
      }

      const roleId = role._id;
      const totalUsers = await Administrator.countDocuments({
        roleId: roleId,
      });

      const { pagination, skip } = await PaginationUtility.paginationParams(
        req,
        totalUsers
      );

      if (pagination.page > pagination.pages) {
        return Response.customResponse(
          res,
          res.statusCode,
          ResponseMessage.OUTOF_DATA
        );
      }

      pagination.data = await SystemUser.find()
        // .populate([{ path: "role", select: "name claims" }])
        .populate({ path: "role", select: "name claims" })
        .select("-password")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (totalUsers === 0) {
        return Response.customResponse(
          res,
          res.statusCode,
          ResponseMessage.NO_DATA
        );
      }

      pagination.data = pagination.data.map((item) => ({
        ...item.toJSON(),
        role: item.role ? item.role.name : null,
        permissions: item.role ? item.role.claims : null,
      }));

      return Response.paginationResponse(res, res.statusCode, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  getAdministrator: async (req, res) => {
    try {
      const person = await Administrator.findById(req.params.id).select();
      if (!person) {
        return res.status(404).json({
          status: 1,
          message: "Administrator not found",
        });
      }
      res.person = person;
    } catch (err) {
      return res.status(500).json({
        status: 0,
        message: err.message,
      });
    }

    const administrator = await res.person;
    return res.status(res.statusCode).json(administrator);
  },
  
  updateAdministrator: async (req, res) => {
    try {
      const { id, ...adminData } = req.body;

      const admin = await Administrator.findById(id);

      if (!admin) {
        return res.status(404).json({
          status: 1,
          message: "Administrator not found",
        });
      }

      // Update other user details
      admin.set(adminData);
      const updatedAdmin = await admin.save();

      return res.status(200).json({
        status: 1,
        updatedAdmin,
      });
    } catch (err) {
      return res.status(400).json({
        status: 0,
        message: err.message,
      });
    }
  },

  deleteAdministrator: async (req, res) => {
    try {
      const person = await Administrator.findById(req.params.id);

      if (!person) {
        return res.status(404).json({
          status: 1,
          message: "Administrator not found",
        });
      }

      await person.deleteOne();

      return res.status(res.statusCode).json({
        status: 1,
        message: "Deleted successfully",
      });
    } catch (err) {
      return res.status(500).json({
        status: 0,
        message: err.message,
      });
    }
  },
};
