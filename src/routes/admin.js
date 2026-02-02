const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

// VULNERABILITY: Hardcoded credentials (testing CI scan)
const ADMIN_PASSWORD = "admin123";
const API_SECRET = "sk-1234567890abcdef";
const DATABASE_URL = "mysql://admin:password123@localhost:3306/app";

// VULNERABILITY: Command Injection
router.get('/ping', (req, res) => {
  const { host } = req.query;

  // User input directly passed to shell command
  exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: stderr });
      return;
    }
    res.json({ result: stdout });
  });
});

// VULNERABILITY: Command Injection - another variant
router.post('/backup', (req, res) => {
  const { filename } = req.body;

  // User-controlled filename in shell command
  exec(`tar -czf /backups/${filename}.tar.gz /data`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: stderr });
      return;
    }
    res.json({ message: 'Backup created', file: `${filename}.tar.gz` });
  });
});

// VULNERABILITY: Path Traversal
router.get('/logs', (req, res) => {
  const { file } = req.query;
  const fs = require('fs');

  // User input used directly in file path
  const logPath = `/var/logs/${file}`;

  try {
    const content = fs.readFileSync(logPath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Could not read log file' });
  }
});

// Simple auth check (using hardcoded password - also a vulnerability)
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    res.json({ token: API_SECRET });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

module.exports = { adminRoutes: router };
