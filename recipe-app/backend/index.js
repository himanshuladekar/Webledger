const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const connectDB = require("./config/db")
const path = require("path") // Added path module

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Initialize Express
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes

app.use("/api/users", require("./routes/authRoutes"))
app.use("/api/recipes", require("./routes/recipeRoutes"))
app.get("/", (req, res) => {
  res.json({message: "server response"})
})

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"))
  })
}

// Set port
const PORT = process.env.PORT || 5000

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

