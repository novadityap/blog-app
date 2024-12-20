import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Comment from '../models/commentModel.js';
import Role from '../models/roleModel.js';
import Category from '../models/categoryModel.js';
import logger from '../utils/logger.js';

export const stats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRoles = await Role.countDocuments();
    const totalCategories = await Category.countDocuments();

    const [{ totalPosts, recentPosts }] = await Post.aggregate()
      .facet({
        totalPosts: [{ $count: 'count' }],
        recentPosts: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
              pipeline: [{ $project: { username: 1 } }],
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
              pipeline: [{ $project: { name: 1 } }],
            },
          },
        ],
      })
      .project({
        totalPosts: {
          $ifNull: [{ $arrayElemAt: ['$totalPosts.count', 0] }, 0],
        },
        recentPosts: 1,
      });

    const [{ totalComments, recentComments }] = await Comment.aggregate()
      .facet({
        totalComments: [{ $count: 'count' }],
        recentComments: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
              pipeline: [{ $project: { username: 1 } }],
            },
          },
          {
            $lookup: {
              from: 'posts',
              localField: 'postId',
              foreignField: '_id',
              as: 'post',
              pipeline: [{ $project: { title: 1 } }],
            },
          },
        ],
      })
      .project({
        totalComments: {
          $ifNull: [{ $arrayElemAt: ['$totalComments.count', 0] }, 0],
        },
        recentComments: 1,
      });

    logger.info('statistics data retrieved successfully');
    res.json({
      code: 200,
      message: 'Statistics data retrieved successfully',
      data: {
        totalUsers,
        totalPosts,
        totalComments,
        totalRoles,
        totalCategories,
        recentPosts,
        recentComments,
      },
    });
  } catch (e) {
    next(e);
  }
};

export default { stats };
