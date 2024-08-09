import express from "express";
import connectDB from "./config/dbConnect.js";
import logger from "./config/logger.js";

const port = process.env.PORT || 3000;
const app = express();
connectDB();

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});