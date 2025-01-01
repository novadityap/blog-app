import seedRole from "./roleSeeder.js";
import seedUser from "./userSeeder.js";
import seedCategory from "./categorySeeder.js";
import logger from "../utils/logger.js";
import connectDB from '../config/connection.js';
import 'dotenv/config';

const seed = async () => {
  try {
    await connectDB();
    await seedRole();
    await seedUser();
    await seedCategory();

    logger.info('database seeded successfully');
    process.exit(0);
  } catch (err) {
    logger.error('database seeded unsuccessfully', { stack: err.stack });
    process.exit(1);
  }
}

seed();

export default seed;