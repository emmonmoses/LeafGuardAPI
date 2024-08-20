const mongoose = require("mongoose");

const treeReceptionSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      enum: ['Government', 'NGO\'S', 'Community', 'Private Company', 'Individuals'],
      required: true,
    },
    sourceName: {
      type: String,
      required: true,
    },
    contactPersonName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    dateReceived: {
      type: Date,
      required: true,
    },
    numberOfTrees: {
      type: Number,
      required: true,
    },
    typeOfTrees: {
      type: String,
      required: true,
    },
    conditionOfTrees: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      required: true,
    },
    receivedBy: {
      type: String,
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      required: true,
    },
    verifiedDate: {
      type: Date,
      required: true,
    },
    verifiedBy: {
      type: String,
      required: true,
    },
  },
  {
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
  }
);

treeReceptionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("TreeReception", treeReceptionSchema);
