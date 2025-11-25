import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Device ID middleware for anonymous users
export const deviceIdMiddleware = (req, res, next) => {
  const deviceId = req.header('X-Device-ID');

  if (deviceId) {
    req.deviceId = deviceId;
  }

  next();
};

// Strict: if Authorization header exists and is invalid, return 401. Otherwise fall back to device.
export const authOrDeviceMiddleware = async (req, res, next) => {
  try {
    const tokenHeader = req.header('Authorization');
    const token = tokenHeader?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
          attributes: { exclude: ['password'] }
        });

        if (!user) {
          return res.status(401).json({ success: false, error: 'User not found' });
        }

        req.user = user;
        req.userId = user.id;
        return next();
      } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
      }
    }

    const deviceId = req.header('X-Device-ID');
    if (deviceId) {
      req.deviceId = deviceId;
      return next();
    }

    return res.status(401).json({ success: false, error: 'User or device must be provided' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};
