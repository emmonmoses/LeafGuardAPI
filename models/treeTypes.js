const mongoose = require("mongoose");

// Function to generate the next sequential code
const generateNextCode = async (prefix) => {
  // Find the latest code for the given prefix
  const latestTreeType = await mongoose.model('TreeType').findOne().sort({ code: -1 }).exec();
  
  if (!latestTreeType) {
    return `${prefix}${new Date().getFullYear()}01`; // Starting code if none exist
  }

  const latestCode = latestTreeType.code;
  const latestYear = parseInt(latestCode.substring(2, 6), 10);
  const latestNumber = parseInt(latestCode.substring(6), 10);

  const currentYear = new Date().getFullYear();
  const newNumber = (latestYear === currentYear) ? (latestNumber + 1) : 1;

  return `${prefix}${currentYear}${newNumber.toString().padStart(2, '0')}`;
};

// Define the schema for treeTypes
const treeTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
    },
    status: {
      type: Number,
      enum: [0, 1],
      required: true,
      default: 1, // Default to Active
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save hook to generate the code before saving the document
treeTypeSchema.pre("save", async function (next) {
  if (this.isNew) {
    const prefix = this.name.substring(0, 2).toUpperCase();
    this.code = await generateNextCode(prefix);
  }
  next();
});

module.exports = mongoose.model("TreeType", treeTypeSchema);
