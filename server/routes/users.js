import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { readJsonFile, writeJsonFile } from '../lib/db.js';
import {
  validateLoginPayload,
  validateRegistrationPayload,
  validatePasswordChangePayload
} from '../lib/validators.js';
import {
  hashPassword,
  sanitizeUser,
  storeSessionUser,
  clearSessionUser,
  getSessionUser
} from '../lib/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const usersPath = join(__dirname, '../data/users.json');

const readUsers = () => readJsonFile(usersPath, []);
const writeUsers = (users) => writeJsonFile(usersPath, users);

const findUserByName = (users, name) =>
  users.find((user) => user.name.toLowerCase() === name.toLowerCase());

const findUserById = (users, id) =>
  users.find((user) => user.id === id);

// Login
router.post('/login', (req, res) => {
  try {
    const validation = validateLoginPayload(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { name, password } = validation.data;
    const users = readUsers();
    const user = findUserByName(users, name);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = hashPassword(password);

    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    user.lastLogin = new Date().toISOString();
    writeUsers(users);

    storeSessionUser(req, user);

    return res.json({
      ...sanitizeUser(user),
      isNewUser: false
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Register
router.post('/register', (req, res) => {
  try {
    const validation = validateRegistrationPayload(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { name, password } = validation.data;
    const users = readUsers();
    const existingUser = findUserByName(users, name);

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const newUser = {
      id: uuidv4(),
      name,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    storeSessionUser(req, newUser);

    res.status(201).json({
      ...sanitizeUser(newUser),
      isNewUser: true
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Current logged in user
router.get('/me', (req, res) => {
  try {
    const sessionUser = getSessionUser(req);

    if (!sessionUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json(sessionUser);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    await clearSessionUser(req);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Get all users
router.get('/', (_req, res) => {
  try {
    const users = readUsers();
    res.json(users.map(sanitizeUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get one user
router.get('/:id', (req, res) => {
  try {
    const users = readUsers();
    const user = findUserById(users, req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update password
router.put('/:id/password', (req, res) => {
  try {
    const validation = validatePasswordChangePayload(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { oldPassword, newPassword } = validation.data;
    const users = readUsers();
    const userIndex = users.findIndex((user) => user.id === req.params.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedOldPassword = hashPassword(oldPassword);

    if (users[userIndex].password !== hashedOldPassword) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    users[userIndex].password = hashPassword(newPassword);
    writeUsers(users);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;