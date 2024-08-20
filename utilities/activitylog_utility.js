const ActivityLog = require("../models/activity_log");
const DateUtil = require("../utilities/date_utility");

const createActivityLog = async (modulename, action, user) => {
  const log = new ActivityLog({
    name: modulename,
    action: action,
    actionOn: DateUtil.currentDate(),
    userId: user,
  });

  await log.save();

  // return log;
};

module.exports = { createActivityLog };
