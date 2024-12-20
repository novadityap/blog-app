import Role from '../models/roleModel.js';
import Permission from '../models/permissionModel.js';
import logger from '../utils/logger.js';

const seedRole = async () => {
  const permissions = await Permission.find();
  const userPermissions = [
    'show_user',
    'update_user',
    'remove_user',
    'create_comment',
    'remove_comment',
    'like_post',  
  ];

  const roles = [
    { name: 'admin', permissions: [] },
    { name: 'user', permissions: [] },
  ];

    for (let permission of permissions) {
    roles[0].permissions.push(permission._id);
    if (userPermissions.includes(permission.name)) roles[1].permissions.push(permission._id);
  }

  await Role.deleteMany();
  await Role.insertMany(roles);

  logger.info('roles seeded successfully');
};

export default seedRole;
