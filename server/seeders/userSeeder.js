import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';

const seedUser = async () => {
    try {
      await User.deleteMany({});
      const roles = await Role.find({ name: { $in: ['admin', 'user'] } });

      if (roles.length < 2) {
        logger.error('Insufficient roles in the database. Seeding failed.');
        return;
      }

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

      await User.insertMany(users);
      logger.info('user seeded successfully');
    } catch (err) {
      logger.error(`failed seeding user - ${err}`);
    }
  };

export default seedUser;