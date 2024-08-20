const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
// Default to .env file
let envFileName = '.env'; 

if (process.env.NODE_ENV === 'production') {
  envFileName = '.env.production';
} else if (process.env.NODE_ENV === 'development') {
  envFileName = '.env.development';
}

dotenv.config({ path: envFileName });

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const apiRouter = require("./routes");
const versioningMiddleware = require("./middlewares/versioning");

const app = express();
const dbUrl = process.env.DB_URL;
const port = process.env.API_PORT;

// Enable CORS for all domains
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  next();
});

// DbConnect
mongoose.set("strictQuery", false);
mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to mongooseDb"))
  .catch((e) => console.log(e));

// Middlewares
app.use(express.json());
app.use(versioningMiddleware);

// Main router file
app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});
