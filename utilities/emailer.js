const nodemailer = require("nodemailer");
require("dotenv").config();
const Response = require("../utilities/response_utility");
const ResponseMessage = require("./messages_utility");

const sendEmail = (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: "etonestop@outlook.com",
      pass: "itygabjqodkneycs",
    },
  });

  const mailOptions = {
    from: {
      name: "treeplanting REAL ESTATE",
      address: "etonestop@outlook.com",
    },
    to,
    subject,
    html: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // console.log("Email NOT sent: " + info.response);
      return Response.errorResponse(res, 500, error);
    } else {
      // console.log("Email sent: " + info.response);
      return Response.customResponse(
        res,
        res.statusCode,
        ResponseMessage.EMAIL_SUCCESS
      );
    }
  });
};

module.exports = { sendEmail };
