import * as fs from 'node:fs/promises';
import path from 'node:path';
import User from '../src/models/userModel.js';
import jwt from 'jsonwebtoken';

export const createTestUser = async () => {
  return await User.create({
    username: 'test',
    email: 'test@me.com',
    password: 'test123',
  });
};

export const createManyTestUsers = async (count) => {
  for (let i = 0; i < count; i++) {
    await User.create({
      username: `test${i}`,
      email: `test${i}@me.com`,
      password: 'test123',
    });
  }
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

export const createAuthToken = (type) => {
  return jwt.sign({
     id: '123',
     roles: ['admin'],
    }, 
    type === 'auth' ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET, 
    {expiresIn: type === 'auth' ? process.env.JWT_EXPIRES : process.env.JWT_REFRESH_EXPIRES}
  );
}

export const fileExists = async (directory, filename) => {
  const directories = {
    avatars: process.env.AVATAR_UPLOADS_DIR,
    posts: process.env.POST_UPLOADS_DIR,
  };

  const filePath = path.join(process.cwd(), directories[directory], filename);

  try {
    await fs.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}

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
    return (
      new Date(log.timestamp) > startTime &&
      log.message === message
    );
  });
}
