const db = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        if (results.length > 0) {
          return res.status(400).json({
            message: "Email already exists",
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        db.query(
          "INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
          [name, email, hashedPassword, role || "staff"],
          (err, result) => {
            if (err) {
              return res.status(500).json({
                message: err.message,
              });
            }

            res.status(201).json({
              message: "User registered successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }

        if (results.length === 0) {
          return res.status(400).json({
            message: "Invalid email or password",
          });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!isMatch) {
          return res.status(400).json({
            message: "Invalid email or password",
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

        res.status(200).json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({
    message: "Logout successful. Please remove the token from the client.",
  });
};