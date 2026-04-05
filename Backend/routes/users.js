const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

// Middleware (token check)
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json("Access denied");

    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(400).json("Invalid token");
  }
};

// GET all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, name, email, age FROM users"
    );
    res.json(users.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// CREATE user
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, age } = req.body;

    const newUser = await pool.query(
      "INSERT INTO users (name, email, age) VALUES ($1,$2,$3) RETURNING *",
      [name, email, age]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// UPDATE user
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    const updatedUser = await pool.query(
      "UPDATE users SET name=$1, email=$2, age=$3 WHERE id=$4 RETURNING *",
      [name, email, age, id]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// DELETE user
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM users WHERE id=$1", [id]);

    res.json("User deleted successfully");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;