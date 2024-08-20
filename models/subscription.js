const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
    },
    propertyType: {
      type: String,
    },
    location: {
      type: String,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    bedRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BedRoom",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Administrator",
    },
    feeTypes: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FeeType",
        },
        _id: false,
      },
    ],
    description: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
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
        // delete ret.customerId;
        // delete ret.bedRoomId;
        // delete ret.adminId;
        delete ret.feeTypes.Id;
      },
    },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        // delete ret.customerId;
        // delete ret.bedRoomId;
        // delete ret.adminId;
        delete ret.feeTypes.Id;
      },
    },
  }
);

subscriptionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

subscriptionSchema.virtual("customer", {
  ref: "Customer",
  localField: "customerId",
  foreignField: "_id",
  justOne: true,
});

subscriptionSchema.virtual("bedRooms", {
  ref: "BedRoom",
  localField: "bedRoomId",
  foreignField: "_id",
  justOne: true,
});

subscriptionSchema.virtual("creator", {
  ref: "Administrator",
  localField: "adminId",
  foreignField: "_id",
  justOne: true,
});

subscriptionSchema.virtual("feeTypeDetails", {
  ref: "FeeType",
  localField: "feeTypes.id",
  foreignField: "_id",
  justOne: false,
});


module.exports = mongoose.model("Subscription", subscriptionSchema);
