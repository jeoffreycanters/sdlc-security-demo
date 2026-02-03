const express = require('express');
const { execFile } = require('child_process');
const router = express.Router();

// Fixed: Use environment variables instead of hardcoded credentials
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const API_SECRET = process.env.API_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

// Fixed: Use execFile with argument array to prevent command injection
router.get('/ping', (req, res) => {
  const { host } = req.query;

  // Validate host input - only allow alphanumeric, dots, and hyphens
  if (!host || !/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).json({ error: 'Invalid host parameter' });
  }

  // Use execFile with arguments array - no shell interpretation
  execFile('ping', ['-c', '1', host], (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: 'Ping failed' });
      return;
    }
    res.json({ result: stdout });
  });
});

// Fixed: Use execFile with argument array and validate filename
router.post('/backup', (req, res) => {
  const { filename } = req.body;

  // Validate filename - only allow alphanumeric, underscores, and hyphens
  if (!filename || !/^[a-zA-Z0-9_-]+$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename parameter' });
  }

  // Use execFile with arguments array - no shell interpretation
  execFile('tar', ['-czf', `/backups/${filename}.tar.gz`, '/data'], (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: 'Backup failed' });
      return;
    }
    res.json({ message: 'Backup created', file: `${filename}.tar.gz` });
  });
});

// Fixed: Prevent path traversal by using path.basename()
router.get('/logs', (req, res) => {
  const { file } = req.query;
  const fs = require('fs');
  const path = require('path');

  // Validate file parameter exists
  if (!file) {
    return res.status(400).json({ error: 'File parameter is required' });
  }

  // Use path.basename() to prevent directory traversal
  const safeFilename = path.basename(file);

  // Additional validation - only allow alphanumeric, dots, underscores, and hyphens
  if (!/^[a-zA-Z0-9._-]+$/.test(safeFilename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const logPath = path.join('/var/logs', safeFilename);

  try {
    const content = fs.readFileSync(logPath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Could not read log file' });
  }
});

// Fixed: Use timing-safe comparison to prevent timing attacks
router.post('/login', (req, res) => {
  const { password } = req.body;
  const crypto = require('crypto');

  // Check if required environment variables are set
  if (!ADMIN_PASSWORD || !API_SECRET) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Convert strings to buffers for timing-safe comparison
  const passwordBuffer = Buffer.from(password || '');
  const adminPasswordBuffer = Buffer.from(ADMIN_PASSWORD);

  // Ensure buffers are the same length for timingSafeEqual
  let isValid = false;
  if (passwordBuffer.length === adminPasswordBuffer.length) {
    try {
      isValid = crypto.timingSafeEqual(passwordBuffer, adminPasswordBuffer);
    } catch (error) {
      isValid = false;
    }
  }

  if (isValid) {
    res.json({ token: API_SECRET });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

module.exports = { adminRoutes: router };
