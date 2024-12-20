import Category from '../models/categoryModel.js';
import ResponseError from '../utils/responseError.js';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  searchCategorySchema,
} from '../validations/categoryValidation.js';
import validate from '../utils/validate.js';
import logger from '../utils/logger.js';

const create = async (req, res, next) => {
  try {
    const fields = validate(createCategorySchema, req.body);

    const isNameTaken = await Category.exists({ name: fields.name });
    if (isNameTaken) {
      logger.warn('resource already in use');
      throw new ResponseError('Resource already in use', 409, {
        name: 'Name already in use',
      });
    }

    await Category.create(fields);

    logger.info('category created successfully');
    res.status(201).json({
      code: 201,
      message: 'Category created successfully',
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const categoryId = validate(getCategorySchema, req.params.categoryId);
    const fields = validate(updateCategorySchema, req.body);

    const category = await Category.findById(categoryId);
    if (!category) {
      logger.warn('category not found');
      throw new ResponseError('Category not found', 404);
    }

    if (fields.name && fields.name !== category.name) {
      const isNameTaken = await Category.exists({ name: fields.name });

      if (isNameTaken) {
        logger.warn('resource already in use');
        throw new ResponseError('Resource already in use', 409, {
          name: 'Name already in use',
        });
      }
    }

    Object.assign(category, fields);
    await category.save();

    logger.info('category updated successfully');
    res.json({
      code: 200,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    const categoryId = validate(getCategorySchema, req.params.categoryId);

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      logger.warn('category not found');
      throw new ResponseError('Category not found', 404);
    }

    logger.info('category deleted successfully');
    res.json({
      code: 200,
      message: 'Category deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};

const show = async (req, res, next) => {
  try {
    const categoryId = validate(getCategorySchema, req.params.categoryId);

    const category = await Category.findById(categoryId);
    if (!category) {
      logger.warn('category not found');
      throw new ResponseError('Category not found', 404);
    }

    logger.info('category retrieved successfully');
    res.json({
      code: 200,
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (e) {
    next(e);
  }
};

export const search = async (req, res, next) => {
  try {
    const query = validate(searchCategorySchema, req.query);
    const { page, limit, search } = query;

    const [{ categories, totalCategories }] = await Category.aggregate()
      .lookup({
        from: 'posts',
        localField: '_id',
        foreignField: 'category',
        as: 'posts',
        pipeline: [{ $count: 'count' }],
      })
      .addFields({
        totalPosts: { $ifNull: [{ $arrayElemAt: ['$posts.count', 0] }, 0] },
      })
      .project({ posts: 0 })
      .match(search ? { name: { $regex: search, $options: 'i' } } : {})
      .facet({
        categories: [
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        totalCategories: [{ $count: 'count' }],
      })
      .project({
        categories: 1,
        totalCategories: {
          $ifNull: [{ $arrayElemAt: ['$totalCategories.count', 0] }, 0],
        },
      });

    if (categories.length === 0) {
      logger.info('no categories found');
      return res.json({
        code: 200,
        message: 'No categories found',
        data: [],
        meta: {
          pageSize: limit,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        },
      });
    }

    logger.info('categories retrieved successfully');
    res.json({
      code: 200,
      message: 'Categories retrieved successfully',
      data: categories,
      meta: {
        pageSize: limit,
        totalItems: totalCategories,
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit),
      },
    });
  } catch (e) {
    next(e);
  }
};

const list = async (req, res, next) => {
  try {
    const categories = await Category.find().select('name');
    if (categories.length === 0) {
      logger.info('no categories found');
      return res.json({
        code: 200,
        message: 'No categories found',
        data: [],
      });
    }

    logger.info('categories retrieved successfully');
    res.json({
      code: 200,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  } catch (e) {
    next(e);
  }
};

export default { create, update, remove, show, search, list };
