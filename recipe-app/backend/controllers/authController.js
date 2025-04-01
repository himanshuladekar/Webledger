const User = require("../models/User")
const jwt = require("jsonwebtoken")

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// Register a new user
// POST /api/users
exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ username })
    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      username,
      password,
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      })
    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Authenticate user & get token
// POST /api/users/login
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user by username
    const user = await User.findOne({ username })

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      })
    } else {
      res.status(401).json({ message: "Invalid username or password" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get user profile
// GET /api/users/profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
      })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

