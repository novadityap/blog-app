import User from '../src/models/userModel.js';
import Category from '../src/models/categoryModel.js';
import Post from '../src/models/postModel.js';
import Role from '../src/models/roleModel.js';
import Comment from '../src/models/commentModel.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'node:path';
import cloudinary from '../src/utils/cloudinary.js';
import extractPublicId from '../src/utils/extractPublicId.js';

export const createTestUser = async (fields = {}) => {
  const role = await createTestRole({ name: 'admin' });

  return await User.create({
    username: 'test',
    email: 'test@me.com',
    password: await bcrypt.hash('test123', 10),
    role: role._id,
    ...fields,
  });
};

export const createManyTestUsers = async () => {
  const role = await createTestRole({ name: 'admin' });
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

  return await Promise.all(users);
};

export const removeTestUser = async () => {
  await User.deleteMany({ username: { $regex: /^test\d*/ } });
};

export const createTestComment = async (fields = {}) => {
  const user = await createTestUser();
  return await Comment.create({
    text: 'test',
    user: user._id,
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

  return await Promise.all(comments);
};

export const removeTestComment = async () => {
  await Comment.deleteMany({ text: { $regex: /^test\d*/ } });
};

export const createTestRole = async (fields = {}) => {
  return await Role.create({
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

  return await Promise.all(roles);
};

export const removeTestRole = async () => {
  await Role.deleteMany({ name: { $regex: /^test\d*/ } });
};

export const createTestCategory = async (fields = {}) => {
  return await Category.create({
    name: 'test',
    ...fields,
  });
};

export const createManyTestCategories = async () => {
  const categories = [];

  for (let i = 0; i < 15; i++) {
    categories.push(createTestCategory({ name: `test${i}` }));
  }

  return await Promise.all(categories);
};

export const removeTestCategory = async () => {
  await Category.deleteMany({ name: { $regex: /^test\d*/ } });
};

export const createTestPost = async (fields = {}) => {
  const user = await createTestUser();
  const category = await createTestCategory();

  return await Post.create({
    title: 'test',
    slug: 'test',
    content: 'test',
    user: user._id,
    category: category._id,
    ...fields,
  });
};

export const createManyTestPosts = async () => {
  const users = await createManyTestUsers();
  const categories = await createManyTestCategories();
  const posts = [];

  for (let i = 0; i < 15; i++) {
    posts.push(
      createTestPost({
        title: `test${i}`,
        slug: `test${i}`,
        content: `test${i}`,
        user: users[i]._id,
        category: categories[i]._id,
      })
    );
  }

  return await Promise.all(posts);
};

export const removeTestPost = async () => {
  await Post.deleteMany({ title: { $regex: /^test\d*/ } });
};

export const createToken = (type, role, userId) => {
  return jwt.sign(
    {
      id: userId || new mongoose.Types.ObjectId(),
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
