import mongoose from "mongoose";
import seedPermission from "./permissionSeeder.js";
import seedRole from "./roleSeeder.js";
import seedUser from "./userSeeder.js";
import seedCategory from "./categorySeeder.js";
import logger from "../utils/logger.js";
import connectDB from '../config/connection.js';
const seed = async () => {
  try {
    await connectDB();
    await seedCategory();
    await seedPermission();
    await seedRole();
    await seedUser();

    logger.info('database seeded successfully');
  } catch (err) {
    logger.error(`database seeding failed - ${err}`);
  } finally {
    mongoose.connection.close();
    logger.info('database connection closed');
  }
}

seed();

export default seed;