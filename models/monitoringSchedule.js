const mongoose = require('mongoose');

const monitoringScheduleSchema = new mongoose.Schema({
    beginFrom: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    site: {
        type: String,
        required: true
    },
    AssignedBy: {
        type: String,
        required: true
    },
    responsibleTeam: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const MonitoringSchedule = mongoose.model('MonitoringSchedule', monitoringScheduleSchema);

module.exports = MonitoringSchedule;
