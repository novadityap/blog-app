import * as fs from 'node:fs/promises';
import path from 'node:path';
import User from '../src/models/userModel.js';
import Category from '../src/models/categoryModel.js';
import Post from '../src/models/postModel.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const uploadDirs = {
  avatars: process.env.AVATAR_UPLOADS_DIR,
  posts: process.env.POST_UPLOADS_DIR,
};

export const createTestUser = async () => {
  return await User.create({
    username: 'test',
    email: 'test@me.com',
    password: 'test123',
  });
};

export const createManyTestUsers = async count => {
  const users = [];

  for (let i = 0; i < count; i++) {
    users.push(
      User.create({
        username: `test${i}`,
        email: `test${i}@me.com`,
        password: 'test123',
      })
    );
  }

  return await Promise.all(users);
};

export const removeAllTestUsers = async () => {
  await User.deleteMany({ username: { $regex: /^test\d*/ } });
};

export const removeTestUser = async () => {
  await User.findOneAndDelete({ username: 'test' });
};

export const getTestUser = async () => {
  return await User.findOne({ username: 'test' });
};

export const createTestCategory = async () => {
  return await Category.create({
    name: 'test',
  });
};

export const createManyTestCategories = async count => {
  const categories = [];

  for (let i = 0; i < count; i++) {
    categories.push(
      Category.create({
        name: `test${i}`,
      })
    );
  }

  return await Promise.all(categories);
};

export const removeTestCategory = async () => {
  await Category.findOneAndDelete({ name: 'test' });
};

export const createTestPost = async () => {
  const user = await createTestUser();
  const category = await createTestCategory();

  return await Post.create({
    title: 'test',
    slug: 'test',
    content: 'test',
    user: user._id,
    category: category._id,
  });
};

export const createManyTestPosts = async count => {
  const users = await createManyTestUsers(count);
  const categories = await createManyTestCategories(count);
  const posts = [];

  for (let i = 0; i < count; i++) {
    posts.push(
      Post.create({
        title: `test${i}`,
        slug: `test${i}`,
        content: 'test',
        user: users[i]._id,
        category: categories[i]._id,
      })
    );
  }

  return await Promise.all(users);
};

export const removeTestPost = async () => {
  await Post.findOneAndDelete({ title: 'test' });
};

export const getTestPost = async () => {
  return await Post.findOne({ title: 'test' });
};

export const removeAllTestPosts = async () => {
  await Post.deleteMany({ title: { $regex: /^test\d*/ } });
};

export const createAuthToken = type => {
  return jwt.sign(
    {
      id: new mongoose.Types.ObjectId(),
      roles: ['admin'],
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

export const fileExists = async (directory, filename) => {
  const filePath = path.join(process.cwd(), uploadDirs[directory], filename);

  try {
    await fs.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
};

export const copyFile = async (source, directory) => {
  const filename = path.basename(source);
  const destinationPath = path.join(
    process.cwd(),
    uploadDirs[directory],
    filename
  );

  await fs.copyFile(source, destinationPath);
};

export const removeFile = async (directory, filename) => {
  const directories = {
    avatars: process.env.AVATAR_UPLOADS_DIR,
    posts: process.env.POST_UPLOADS_DIR,
  };
  const filePath = path.join(process.cwd(), directories[directory], filename);

  await fs.unlink(filePath);
};

export const readLogs = async () => {
  const path = `${process.cwd()}/src/logs/app-${
    new Date().toISOString().split('T')[0]
  }.log`;
  const log = await fs.readFile(path, 'utf-8');

  return log
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));
};

export const findRelevantLog = async (message, startTime) => {
  const logs = await readLogs();
  return logs.find(log => {
    return new Date(log.timestamp) > startTime && log.message === message;
  });
};
