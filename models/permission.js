const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    module: {
      type: String,
    },
    actions: [
      {
        name: {
          type: String,
        },
      },
    ],
    isCompany: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        // delete ret._id;
      },
    },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // delete ret._id;
      },
    },
  }
);

permissionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Permission", permissionSchema);
