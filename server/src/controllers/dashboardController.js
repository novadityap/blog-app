import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Comment from '../models/commentModel.js';
import Role from '../models/roleModel.js';
import Permission from '../models/permissionModel.js';
import Category from '../models/categoryModel.js';
import logger from '../utils/logger.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalRoles = await Role.countDocuments();
    const totalPermissions = await Permission.countDocuments();
    const totalCategories = await Category.countDocuments();

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId category', 'username name');
    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId postId', 'username title');


    logger.info(`fetch dashboard data success`);
    res.json({
      code: 200,
      message: 'Dashboard data retrieved successfully',
      data: {
        totalUsers,
        totalPosts,
        totalComments,
        totalRoles,
        totalPermissions,
        totalCategories,
        recentPosts,
        recentComments,
      },
    });
  } catch (err) {
    next(err);
  }
};

