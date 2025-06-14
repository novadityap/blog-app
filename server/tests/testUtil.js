import User from '../src/models/userModel.js';
import Category from '../src/models/categoryModel.js';
import Post from '../src/models/postModel.js';
import Role from '../src/models/roleModel.js';
import Comment from '../src/models/commentModel.js';
import RefreshToken from '../src/models/refreshTokenModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cloudinary from '../src/utils/cloudinary.js';
import extractPublicId from '../src/utils/extractPublicId.js';

export const getTestRefreshToken = async () => {
  const user = await getTestUser();

  return await RefreshToken.findOne({
    user: user._id,
  });
};

export const createTestRefreshToken = async () => {
  const user = await getTestUser();
  const token = jwt.sign(
    {
      sub: user._id,
      role: user.role.name,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );

  return await RefreshToken.create({
    token,
    user: user._id,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
};

export const removeAllTestRefreshTokens = async () => {
  const testUsers = await User.find({
    username: { $regex: '^test' },
  }).select('_id');
  const testUserIds = testUsers.map(user => user._id);

  await RefreshToken.deleteMany({
    userId: { $in: testUserIds },
  });
};

export const getTestUser = async (username = 'test') => {
  return await User.findOne({ username }).populate('role');
};

export const createTestUser = async (fields = {}) => {
  const role = await getTestRole('admin');

  return await User.create({
    username: 'test',
    email: 'test@me.com',
    password: await bcrypt.hash('test123', 10),
    role: role._id,
    ...fields,
  });
};

export const createManyTestUsers = async () => {
  const role = await getTestRole('admin');

  for (let i = 0; i < 15; i++) {
    await User.create({
      username: `test${i}`,
      email: `test${i}@email.com`,
      password: await bcrypt.hash('test123', 10),
      role: role._id,
      avatar: process.env.DEFAULT_AVATAR_URL,
    });
  }
};

export const updateTestUser = async (fields = {}) => {
  return await User.findOneAndUpdate(
    { username: 'test' },
    { ...fields },
    { new: true }
  );
};

export const removeAllTestUsers = async () => {
  await User.deleteMany({ username: { $regex: /^test\d*/ } });
};

export const getTestComment = async (text = 'test') => {
  return await Comment.findOne({ text }).populate('post');
};

export const createTestComment = async (fields = {}) => {
  const user = await getTestUser();
  const post = await getTestPost();

  return await Comment.create({
    text: 'test',
    user: user._id,
    post: post._id,
    ...fields,
  });
};

export const createManyTestComments = async () => {
  const user = await getTestUser();
  const post = await getTestPost();

  for (let i = 0; i < 15; i++) {
    await Comment.create({
      text: `test${i}`,
      user: user._id,
      post: post._id,
    });
  }
};

export const removeAllTestComments = async () => {
  await Comment.deleteMany({ text: { $regex: /^test\d*/ } });
};

export const getTestRole = async (name = 'test') => {
  return await Role.findOne({ name });
};

export const createTestRole = async (fields = {}) => {
  return await Role.create({
    name: 'test',
    ...fields,
  });
};

export const createManyTestRoles = async () => {
  for (let i = 0; i < 15; i++) {
    await Role.create({
      name: `test${i}`,
    });
  }
};

export const removeAllTestRoles = async () => {
  await Role.deleteMany({ name: { $regex: /^test\d*/ } });
};

export const getTestCategory = async (name = 'test') => {
  return await Category.findOne({ name });
};

export const createTestCategory = async (fields = {}) => {
  return await Category.create({
    name: 'test',
    ...fields,
  });
};

export const createManyTestCategories = async () => {
  for (let i = 0; i < 15; i++) {
    await Category.create({
      name: `test${i}`,
    });
  }
};

export const removeAllTestCategories = async () => {
  await Category.deleteMany({ name: { $regex: /^test\d*/ } });
};

export const getTestPost = async (title = 'test') => {
  return await Post.findOne({ title });
};

export const createTestPost = async (fields = {}) => {
  const user = await getTestUser();
  const category = await getTestCategory();

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
  const user = await getTestUser();
  const category = await getTestCategory();

  for (let i = 0; i < 15; i++) {
    await Post.create({
      title: `test${i}`,
      slug: `test${i}`,
      content: `test${i}`,
      user: user._id,
      category: category._id,
    });
  }
};

export const updateTestPost = async (fields = {}) => {
  return await Post.findOneAndUpdate(
    { title: 'test' },
    { ...fields },
    { new: true }
  );
};

export const removeAllTestPosts = async () => {
  await Post.deleteMany({ title: { $regex: /^test\d*/ } });
};

export const createAccessToken = async () => {
  const user = await getTestUser();
  global.accessToken = jwt.sign(
    {
      sub: user._id,
      role: user.role.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
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
