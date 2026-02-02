const express = require('express');
const router = express.Router();
const { db } = require('../db/connection');

// VULNERABILITY: SQL Injection - user input directly concatenated
router.get('/search', async (req, res) => {
  const { name } = req.query;
  const query = "SELECT * FROM users WHERE name = '" + name + "'";

  try {
    const [results] = await db.execute(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: SQL Injection - another variant
router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  const query = `SELECT * FROM users WHERE id = ${userId}`;

  try {
    const [results] = await db.execute(query);
    res.json(results[0] || { error: 'User not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: XSS - unsanitized output
router.get('/profile/:id', async (req, res) => {
  const { id } = req.params;
  const { bio } = req.query;

  // Directly embedding user input in HTML response
  const html = `
    <html>
      <body>
        <h1>User Profile</h1>
        <p>Bio: ${bio}</p>
      </body>
    </html>
  `;

  res.send(html);
});

// SECURE: Parameterized query (for comparison)
router.post('/secure', async (req, res) => {
  const { name, email } = req.body;
  const query = "INSERT INTO users (name, email) VALUES (?, ?)";

  try {
    const [result] = await db.execute(query, [name, email]);
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { userRoutes: router };
