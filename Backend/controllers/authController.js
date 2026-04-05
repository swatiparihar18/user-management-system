const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    // FIX: validate before bcrypt — undefined password causes 500 crash
    if (!name || !email || !age || !password) {
      return res.status(400).json("All fields are required");
    }

    // Check if email already exists
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json("Email already registered");
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await pool.query(
      "INSERT INTO users(name,email,age,password) VALUES($1,$2,$3,$4) RETURNING id,name,email,age",
      [name, email, age, hash]
    );

    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // FIX: validate before querying
    if (!email || !password) {
      return res.status(400).json("Email and password are required");
    }

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (user.rows.length === 0) {
      return res.status(400).json("User not found");
    }

    const valid = await bcrypt.compare(password, user.rows[0].password);

    if (!valid) {
      return res.status(400).json("Wrong password");
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json(err.message);
  }
};