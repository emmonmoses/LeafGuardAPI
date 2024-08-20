const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    required: true,
  },
}, {
  versionKey: false,
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
    },
  },
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
    },
  },
  timestamps: true,
});

// Virtual field for id
statusSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Status", statusSchema);
