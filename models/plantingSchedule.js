const mongoose = require('mongoose');

const plantingScheduleSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: true
    },
    numberOfTrees: {
        type: Number,
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

const PlantingSchedule = mongoose.model('PlantingSchedule', plantingScheduleSchema);

module.exports = PlantingSchedule;
