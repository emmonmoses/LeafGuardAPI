const moment = require("moment-timezone");
require("moment");

module.exports = {
  currentDate: () => moment().tz("Africa/Nairobi").toDate(),
  validFromDate: () => moment().tz("Africa/Nairobi").add(3, "hours"),
  expirationDate: () => moment().tz("Africa/Nairobi").add(7, "hours"),
};
