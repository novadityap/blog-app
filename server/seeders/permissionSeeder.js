import Permission from '../models/permissionModel.js';
import logger from '../utils/logger.js';

const seedPermission = async () => {
  const resources = ['permission', 'role', 'user', 'post', 'comment'];
  const actions = ['create', 'read', 'update', 'delete'];
  
  const permissions = resources.flatMap(resource => {
    return actions
    .filter(action => !(resource === 'post' && action === 'read') && !(resource === 'comment' && action === 'read'))
    .map(action => ({
      action,
        resource,
        description: `permission to ${action} ${resource}`,
      }));
    });
    
  try {
    await Permission.deleteMany({});
    await Permission.insertMany(permissions);
    logger.info('permissions seeded successfully');
  } catch (err) {
    logger.error(`failed seeding permissions - ${err}`);
  }
};

export default seedPermission;
