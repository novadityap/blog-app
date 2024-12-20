import 'dotenv/config';
import connectDB from './src/config/connection.js';
import mongoose from 'mongoose';
import seedPermission from './src/seeders/permissionSeeder.js';
import seedRole from './src/seeders/roleSeeder.js';
import { createToken } from './tests/testUtil.js';

beforeAll(async () => {
  await connectDB();
  await mongoose.connection.db.dropDatabase();
  await seedPermission();
  await seedRole();

  global.userToken = createToken('auth', 'user');
  global.adminToken = createToken('auth', 'admin');
  global.adminRefreshToken = createToken('refresh', 'admin');
  global.validObjectId = new mongoose.Types.ObjectId();
});

afterAll(async () => {
  await mongoose.connection.close();
});