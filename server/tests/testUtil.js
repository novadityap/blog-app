import User from '../src/models/userModel.js';
import Category from '../src/models/categoryModel.js';
import Post from '../src/models/postModel.js';
import Role from '../src/models/roleModel.js';
import Comment from '../src/models/commentModel.js';
import RefreshToken from '../src/models/refreshTokenModel.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cloudinary from '../src/utils/cloudinary.js';
import extractPublicId from '../src/utils/extractPublicId.js';

export const getTestRefreshToken = async (fields = {}) => {
  const user = await getTestUser();

  return await RefreshToken.findOne({
    user: user._id,
    ...fields,
  });
};

export const createTestRefreshToken = async (fields = {}) => {
  const user = await getTestUser();
  const token = createToken('refresh', 'admin', user._id);

  await RefreshToken.create({
    token,
    user: user._id,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    ...fields,
  });
};

export const removeAllTestRefreshTokens = async () => {
  await RefreshToken.deleteMany();
};

export const getTestUser = async (fields = {}) => {
  return await User.findOne({
    username: 'test',
    ...fields,
  });
};

export const createTestUser = async (fields = {}) => {
  const role = await getTestRole();

  await User.create({
    username: 'test',
    email: 'test@me.com',
    password: await bcrypt.hash('test123', 10),
    role: role._id,
    ...fields,
  });
};

export const createManyTestUsers = async () => {
  const role = await getTestRole();
  const users = [];

  for (let i = 0; i < 15; i++) {
    users.push(
      createTestUser({
        username: `test${i}`,
        email: `test${i}@me.com`,
        role: role._id,
      })
    );
  }

  await Promise.all(users);
};

export const updateTestUser = async (fields = {}) => {
  await User.findOneAndUpdate(
    { username: 'test' }, 
    { ...fields },
    { new: true }
  );
}

export const removeAllTestUsers = async () => {
  await User.deleteMany({ username: { $regex: /^test\d*/ } });
};

export const getTestComment = async (fields = {}) => {
  return await Comment.findOne({
    text: 'test',
    ...fields,
  }).populate('post');
};

export const createTestComment = async (fields = {}) => {
  const user = await getTestUser();
  const post = await getTestPost();
  
  await Comment.create({
    text: 'test',
    user: user._id,
    post: post._id,
    ...fields,
  });
};

export const createManyTestComments = async () => {
  const comments = [];

  for (let i = 0; i < 15; i++) {
    comments.push(
      createTestComment({
        text: `test${i}`,
      })
    );
  }

  await Promise.all(comments);
};

export const removeAllTestComments = async () => {
  await Comment.deleteMany({ text: { $regex: /^test\d*/ } });
};

export const getTestRole = async (fields = {}) => {
  return await Role.findOne({
    name: 'test',
    ...fields,
  });
};

export const createTestRole = async (fields = {}) => {
  await Role.create({
    name: 'test',
    ...fields,
  });
};

export const createManyTestRoles = async () => {
  const roles = [];

  for (let i = 0; i < 15; i++) {
    roles.push(
      createTestRole({
        name: `test${i}`,
      })
    );
  }

  await Promise.all(roles);
};

export const removeAllTestRoles = async () => {
  await Role.deleteMany({ name: { $regex: /^test\d*/ } });
};

export const getTestCategory = async (fields = {}) => {
  return await Category.findOne({
    name: 'test',
    ...fields,
  });
};

export const createTestCategory = async (fields = {}) => {
  await Category.create({
    name: 'test',
    ...fields,
  });
};

export const createManyTestCategories = async () => {
  const categories = [];

  for (let i = 0; i < 15; i++) {
    categories.push(createTestCategory({ name: `test${i}` }));
  }

  await Promise.all(categories);
};

export const removeAllTestCategories = async () => {
  await Category.deleteMany({ name: { $regex: /^test\d*/ } });
};

export const getTestPost = async (fields = {}) => {
  return await Post.findOne({
    title: 'test',
    ...fields,
  });
};

export const createTestPost = async (fields = {}) => {
  const user = await getTestUser();
  const category = await getTestCategory();

  await Post.create({
    title: 'test',
    slug: 'test',
    content: 'test',
    user: user._id,
    category: category._id,
    ...fields,
  });
};

export const createManyTestPosts = async () => {
  const user = await getTestUser();
  const category = await getTestCategory();
  const posts = [];

  for (let i = 0; i < 15; i++) {
    posts.push(
      createTestPost({
        title: `test${i}`,
        slug: `test${i}`,
        content: `test${i}`,
        user: user._id,
        category: category._id,
      })
    );
  }

  return await Promise.all(posts);
};

export const updateTestPost = async (fields = {}) => {
  await Post.findOneAndUpdate(
    { title: 'test' }, 
    { ...fields },
    { new: true }
  );
}

export const removeAllTestPosts = async () => {
  await Post.deleteMany({ title: { $regex: /^test\d*/ } });
};

export const createToken = (type, role, userId) => {
  return jwt.sign(
    {
      sub: userId || new mongoose.Types.ObjectId(),
      role: role,
    },
    type === 'auth' ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET,
    {
      expiresIn:
        type === 'auth'
          ? process.env.JWT_EXPIRES
          : process.env.JWT_REFRESH_EXPIRES,
    }
  );
};

export const checkFileExists = async url => {
  try {
    await cloudinary.api.resource(extractPublicId(url));
    return true;
  } catch (e) {
    return false;
  }
};

export const removeTestFile = async url => {
  await cloudinary.uploader.destroy(extractPublicId(url));
};
