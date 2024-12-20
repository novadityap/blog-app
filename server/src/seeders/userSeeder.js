import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import { unlink, readdir } from 'node:fs/promises';
import path from 'node:path';

const deleteAvatars = async excludeFilename => {
  const avatarDir = path.join(process.cwd(), process.env.AVATAR_DIR);
  const files = await readdir(avatarDir);

  await Promise.all(
    files
      .filter(file => file !== excludeFilename)
      .map(file => unlink(path.join(avatarDir, file)))
  );
};

const seedUser = async () => {
  const roles = await Role.find({ name: { $in: ['admin', 'user'] } });

  const adminRole = roles.find(role => role.name === 'admin');
  const userRole = roles.find(role => role.name === 'user');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const users = [
    {
      username: 'admin',
      email: 'admin@email.com',
      password: adminPassword,
      roles: [adminRole._id, userRole._id],
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
    {
      username: 'user',
      email: 'user@email.com',
      password: userPassword,
      roles: [userRole._id],
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  ];

  if (process.env.NODE_ENV === 'development') {
    await deleteAvatars('default.png');
    await User.deleteMany();
  }
  
  await User.insertMany(users);

  logger.info('users seeded successfully');
};

export default seedUser;
