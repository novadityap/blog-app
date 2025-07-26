import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';

const seedUser = async () => {
  const roles = await Role.find();
  const userRole = roles.find(role => role.name === 'user');
  const adminRole = roles.find(role => role.name === 'admin');
  const userPassword = await bcrypt.hash('user123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  await User.deleteMany();
  await User.create(
    {
      username: 'admin',
      email: 'admin@email.com',
      password: adminPassword,
      role: adminRole._id,
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
    {
      username: 'user',
      email: 'user@email.com',
      password: userPassword,
      role: userRole._id,
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    }
  );

  logger.info('users seeded successfully');
};

export default seedUser;
