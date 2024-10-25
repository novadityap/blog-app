import postService from '../services/postService';

const create = async (req, res, next) => {
  try {
    await postService.create(req);
    res.status(201).json({
      code: 201,
      message: 'Post created successfully',
    });
  } catch (e) {
    next(e);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { posts, totalPosts, totalPages, hasMore } = await postService.getAll(
      req.queryOptions
    );

    if (posts.length === 0) {
      return res.json({
        code: 200,
        message: 'No posts found',
        data: [],
      });
    }

    res.json({
      code: 200,
      message: 'Posts found',
      data: posts,
      meta: {
        pageSize: req.queryOptions.limit,
        totalItems: totalPosts,
        currentPage: req.queryOptions.page,
        totalPages,
        hasMore,
      },
    });
  } catch (e) {
    next(e);
  }
};

const getById = async (req, res, next) => {
  try {
    const post = await postService.getById(req.params.id);
    res.json({
      code: 200,
      message: 'Post found',
      data: post,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const post = await postService.update(req.params.id, req);
    res.json({
      code: 200,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    await postService.remove(req.params.id);
    res.json({
      code: 200,
      message: 'Post deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
