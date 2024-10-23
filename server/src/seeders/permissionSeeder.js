import Permission from '../models/permissionModel.js';

const seedPermission = async () => {
  const resources = [
    'permission',
    'role',
    'user',
    'post',
    'comment',
    'category',
  ];
  const actions = ['create', 'read', 'update', 'delete'];

  const permissions = resources.flatMap(resource => {
    return actions
      .filter(
        action =>
          !(resource === 'post' && action === 'read') &&
          !(resource === 'comment' && action === 'read')
      )
      .map(action => ({
        action,
        resource,
        description: `permission to ${action} ${resource}`,
      }));
  });

  await Permission.deleteMany({});
  await Permission.insertMany(permissions);
};

export default seedPermission;
