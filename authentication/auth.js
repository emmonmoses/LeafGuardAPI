const { verify } = require("jsonwebtoken");
const Response = require("../utilities/response_utility");
const ResponseMessage = require("../utilities/messages_utility");

module.exports = {
  bearerToken: (req, res, next) => {
    let token = req.get("authorization");
    if (token) {
      token = token.slice(7);
      verify(token, process.env.JWK_SECRET, (err, _decodedObject) => {
        if (err) {
          return Response.errorResponse(res, 400, err);
        } else {
          next();
        }
      });
    } else {
      return Response.customResponse(res, 401, ResponseMessage.ACCESS_DENIED);
    }
  },
};
