import bcrypt from 'bcrypt';
import { queryOne, run } from '../config/database.js';
import { generateToken } from '../config/auth.js';
import { body, validationResult } from 'express-validator';

const ALLOWED_ROLES = ['Manager', 'Admin', 'Cashier'];

/**
 * Validate username format
 */
const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Register a new user (Manager only)
 */
export const register = async (req, res) => {
  try {
    // Check if user is Manager
    if (req.user.role !== 'Manager') {
      return res.status(403).json({
        success: false,
        error: 'Only Managers can create new users',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const { username, email, password, full_name, role } = req.body;

    // Validation
    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        success: false,
        error: 'Username must be 3-50 characters, alphanumeric and underscore only',
        code: 'INVALID_USERNAME'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
        code: 'INVALID_PASSWORD'
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
        code: 'INVALID_ROLE'
      });
    }

    /**
     * Public signup endpoint
     */
    export const signup = async (req, res) => {
      try {
        const { username, email, password, full_name, role } = req.body;

        if (!username || !email || !password || !full_name || !role) {
          return res.status(400).json({
            success: false,
            error: 'All fields are required',
            code: 'MISSING_FIELDS'
          });
        }

        if (!validateUsername(username)) {
          return res.status(400).json({
            success: false,
            error: 'Username must be 3-50 characters, alphanumeric and underscore only',
            code: 'INVALID_USERNAME'
          });
        }

        if (!validateEmail(email)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid email format',
            code: 'INVALID_EMAIL'
          });
        }

        if (!validatePassword(password)) {
          return res.status(400).json({
            success: false,
            error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
            code: 'INVALID_PASSWORD'
          });
        }

        if (!ALLOWED_ROLES.includes(role)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid role',
            code: 'INVALID_ROLE'
          });
        }

        const existingUser = await queryOne(
          'SELECT id FROM users WHERE username = $1 OR email = $2',
          [username, email]
        );

        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'Username or email already exists',
            code: 'USER_EXISTS'
          });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await queryOne(
          `INSERT INTO users (username, email, password_hash, role, full_name)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [username, email, passwordHash, role, full_name]
        );

        const newUser = await queryOne(
          'SELECT id, username, email, role, full_name, created_at FROM users WHERE id = $1',
          [result.id]
        );

        const token = generateToken(newUser);

        res.status(201).json({
          success: true,
          data: {
            user: newUser,
            token
          },
          message: 'Account created successfully'
        });
      } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create account',
          code: 'SIGNUP_ERROR'
        });
      }
    };

    // Check if username or email already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await queryOne(
      `INSERT INTO users (username, email, password_hash, role, full_name) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [username, email, passwordHash, role, full_name]
    );

    const newUser = await queryOne(
      'SELECT id, username, email, role, full_name, created_at FROM users WHERE id = $1',
      [result.id]
    );

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      code: 'REGISTRATION_ERROR'
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username/email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user by username or email
    const user = await queryOne(
      'SELECT * FROM users WHERE (username = $1 OR email = $2) AND is_active = TRUE',
      [username, username]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    };

    res.json({
      success: true,
      data: {
        user: userData,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
};

/**
 * Get current user information
 */
export const getMe = async (req, res) => {
  try {
    const user = await queryOne(
      'SELECT id, username, email, role, full_name, created_at, is_active FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user',
      code: 'GET_USER_ERROR'
    });
  }
};

