import Permission from '../models/permissionModel.js';
import logger from '../utils/logger.js';

const seedPermission = async () => {
  const resources = {
    role: ['create', 'update', 'remove', 'search', 'show'],
    user: ['create', 'update', 'remove', 'search', 'show'],
    post: ['create', 'update', 'remove', 'like'],
    comment: ['create', 'update', 'remove', 'search', 'show', 'list'],
    category: ['create', 'update', 'remove', 'search', 'show', 'list'],
    permission: ['list'],
    dashboard: ['stats'],
  };

  const permissions = Object.entries(resources).flatMap(([resource, actions]) =>
    actions.map((action) => ({ name: `${action}_${resource}` }))
  );

  await Permission.deleteMany();
  await Permission.insertMany(permissions);
  logger.info('permissions seeded successfully');
};

export default seedPermission;
