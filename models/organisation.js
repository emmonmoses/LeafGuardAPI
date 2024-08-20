const mongoose = require("mongoose");

// Define the tree schema
const treeSchema = new mongoose.Schema(
  {
    TreesType: {
      type: String,
      required: true,
    },
    numberOfTrees: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
    }
  },
  { _id: false }
);

// Define the organisation schema
const organisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },   
    kebele: {
      type: String,
    },
    houseNo: {
      type: String,
    },
    trees: {
      type: [treeSchema],
      default: [],
    },
    type: {
      type: String,
      default: "Organisation",
    }
  },
  {
    versionKey: false,
    collection: "registration",
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
  }
);

// Add a virtual field for id
organisationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Export the model
module.exports = mongoose.model("Organisation", organisationSchema);
