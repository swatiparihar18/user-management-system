const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json(users.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// CREATE user
router.post("/", async (req, res) => {
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
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    const updateUser = await pool.query(
      "UPDATE users SET name=$1, email=$2, age=$3 WHERE id=$4 RETURNING *",
      [name, email, age, id]
    );

    res.json(updateUser.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM users WHERE id=$1", [id]);

    res.json("User deleted successfully");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;