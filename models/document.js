const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    status: {
      type: Number,
      default: 1,
    },
    type: {
      type: String, // Customer or Parent or Driver
    },
    createdAt: {
      type: Date,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      immutable: true,

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

documentSchema.virtual("documentType", {
  ref: "AgentType",
  localField: "type",
  foreignField: "_id",
  justOne: true,
});

documentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Document", documentSchema);
