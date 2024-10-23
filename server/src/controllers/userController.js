import userService from '../services/userService';

const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json({
      code: 200,
      message: 'User found',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { users, totalUsers, totalPages } = await userService.getAll(
      req.queryOptions
    );

    if (users.length === 0) {
      return res.json({
        code: 200,
        message: 'No users found',
        data: [],
      });
    }

    res.json({
      code: 200,
      message: 'Users found',
      data: users,
      meta: {
        pageSize: req.queryOptions.limit,
        totalItems: totalUsers,
        currentPage: req.queryOptions.page,
        totalPages,
      },
    });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    await userService.create(req.body);
    res.status(201).json({
      code: 201,
      message: 'User created successfully',
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await userService.update(req.params.id, req);
    res.json({
      code: 200,
      message: 'User updated successfully',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    await userService.remove(req.params.id);
    res.json({
      code: 200,
      message: 'User deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};

export default {
  getById,
  getAll,
  create,
  update,
  remove,
};
