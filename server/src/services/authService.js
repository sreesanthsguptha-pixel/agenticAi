const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const inMemoryStore = require('../config/inMemoryStore');
const dbConfig = require('../config/db');
const env = require('../config/env');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async ({ name, email, password, role = 'operator' }) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    const existing = inMemoryStore.findOne('users', { email: email.toLowerCase() });
    if (existing) {
      const err = new Error('User already exists with this email');
      err.statusCode = 400;
      throw err;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = inMemoryStore.insert('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      lastLogin: new Date()
    });
    const token = generateToken(newUser._id, newUser.role);
    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  } else {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const err = new Error('User already exists with this email');
      err.statusCode = 400;
      throw err;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    });
    const token = generateToken(user._id, user.role);
    const userObj = user.toObject();
    delete userObj.password;
    return { user: userObj, token };
  }
};

const loginUser = async ({ email, password }) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    const user = inMemoryStore.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }
    user.lastLogin = new Date();
    inMemoryStore.updateById('users', user._id, { lastLogin: user.lastLogin });
    const token = generateToken(user._id, user.role);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  } else {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id, user.role);
    const userObj = user.toObject();
    delete userObj.password;
    return { user: userObj, token };
  }
};

const getUserById = async (userId) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    const user = inMemoryStore.findById('users', userId);
    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } else {
    const user = await User.findById(userId);
    return user ? user.toObject() : null;
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  generateToken
};
