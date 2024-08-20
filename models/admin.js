const mongoose = require("mongoose");

const administratorSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      immutable: true,
    },
    adminNumber: {
      min: 3,
      type: String,
    },
    username: {
      min: 3,
      type: String,
    },
    name: {
      min: 3,
      type: String,
    },
    email: {
      min: 3,
      type: String,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    usertype: {
      type: Number,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
    },
    status: {
      type: Number,
    },
    avatar: {
      type: String,
    },
    password: {
      min: 6,
      type: String,
      require: true,
    },
    activity: {
      last_login: {
        type: Date,
        default: Date.now(),
      },
      last_logout: {
        type: Date,
        default: Date.now(),
      },
    },
  },
  {
    versionKey: false,
    collection: "administrators",
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.companyId;
        delete ret.roleId;
        delete ret._id;
      },
    },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.companyId;
        delete ret.roleId;
        delete ret._id;
      },
    },
  }
);

administratorSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

administratorSchema.virtual("role", {
  ref: "Role",
  localField: "roleId",
  foreignField: "_id",
  justOne: true,
});

administratorSchema.virtual("company", {
  ref: "Organisation",
  localField: "companyId",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Administrator", administratorSchema);
