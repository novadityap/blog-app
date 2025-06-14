import 'dotenv/config';
import connectDB from './src/config/connection.js';
import mongoose from 'mongoose';
import seedRole from './src/seeders/roleSeeder.js';
import path from 'node:path';

beforeAll(async () => {
  await connectDB();
  await mongoose.connection.db.dropDatabase();
  await seedRole();

  global.testAvatarPath = path.resolve(
    process.env.AVATAR_DIR_TEST,
    'test-avatar.jpg'
  );
  global.testPostImagePath = path.resolve(
    process.env.POST_DIR_TEST,
    'test-post.jpg'
  );
  global.validObjectId = new mongoose.Types.ObjectId();
});

afterAll(async () => {
  await mongoose.connection.close();
});
