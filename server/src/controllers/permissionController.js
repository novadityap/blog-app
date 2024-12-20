import Permission from '../models/permissionModel.js';
import logger from '../utils/logger.js';

const list = async (req, res, next) => {
  try {
    const permissions = await Permission.find();

    if (permissions.length === 0) {
      logger.info('no permissions found');
      return res.json({
        code: 200,
        message: 'No permissions found',
        data: [],
      });
    }

    logger.info('permissions retrieved successfully');
    res.json({
      code: 200,
      message: 'Permissions retrieved successfully',
      data: permissions,
    });
  } catch (e) {
    next(e);
  }
};

export default { list };
