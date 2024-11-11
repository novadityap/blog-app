import logger from '../utils/logger.js';
import ResponseError from '../utils/responseError.js';

const restrictToAdmin = (req, res, next) => {
  const { roles: currentUserRoles } = req.user;

  if (!currentUserRoles.includes('admin')) {
    logger.warn(`permission denied - user ${req.user.id} does not have admin role`);
    throw new ResponseError('Permission denied', 403);
  }

  next();
}

export default restrictToAdmin;