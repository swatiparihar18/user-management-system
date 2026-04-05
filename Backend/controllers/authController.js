const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  console.log("BODY:", req.body);

  const { name, email, age, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await pool.query(
    "INSERT INTO users(name,email,age,password) VALUES($1,$2,$3,$4) RETURNING *",
    [name, email, age, hash]
  );

  res.json(user.rows[0]);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (user.rows.length === 0) {
    return res.status(400).json("User not found");
  }

  const valid = await bcrypt.compare(password, user.rows[0].password);

  if (!valid) {
    return res.status(400).json("Wrong password");
  }

  const token = jwt.sign(
    { id: user.rows[0].id },
    process.env.JWT_SECRET
  );

  res.json({ token });
};