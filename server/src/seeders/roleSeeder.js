import Role from '../models/roleModel.js';
import logger from '../utils/logger.js';

const seedRole = async () => {
  const roles = ['admin', 'user'];
  await Role.deleteMany();
  await Role.insertMany(roles.map((role) => ({ name: role })));

  logger.info('roles seeded successfully');
};

export default seedRole;
