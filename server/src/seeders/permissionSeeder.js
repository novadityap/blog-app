import Permission from '../models/permissionModel.js';

const seedPermission = async () => {
  const resources = [
    'permission',
    'role',
    'user',
    'post',
    'comment',
    'category',
    'dashboard',
  ];
  const actions = ['create', 'read', 'update', 'delete'];

  const exceptions = {
    post: ['read'],
    dashboard: ['create', 'update', 'delete'],
  };

  const permissions = resources.flatMap(resource =>
    actions
      .filter(action => !(exceptions[resource] || []).includes(action))
      .map(action => ({
        action,
        resource,
        description: `permission to ${action} ${resource}`,
      }))
  );

  await Permission.deleteMany({});
  await Permission.insertMany(permissions);
};

export default seedPermission;
