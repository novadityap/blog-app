import Permission from '../models/permissionModel.js';
import logger from '../utils/logger.js';

const seedPermission = async () => {
  await Permission.deleteMany({});
  
  const resources = ['permission', 'role', 'user', 'post', 'comment'];
  const actions = ['create', 'read', 'update', 'delete'];

  const permissions = [];

  for (let resource of resources) {
    for (let action of actions) {
      if (resource === 'post' && action === 'read') continue; 

      permissions.push({
        action,
        resource,
        description: `permission to ${action} ${resource}`,
      });
    }
  }

  try {
    await Permission.insertMany(permissions);
    logger.info('permissions seeded successfully');
  } catch (err) {
    logger.error(`failed seeding permissions - ${err}`);
  }
};

export default seedPermission;
