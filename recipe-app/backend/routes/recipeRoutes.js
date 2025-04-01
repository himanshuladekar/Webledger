const express = require("express")
const router = express.Router()
const {
  searchRecipes,
  getRecipeById,
  getSavedRecipes,
  saveRecipe,
  removeSavedRecipe,
  reorderSavedRecipes,
} = require("../controllers/recipeController")
const { protect } = require("../middleware/authMiddleware")

// Search recipes
router.get("/search", searchRecipes)

// Get recipe details
router.get("/:id", getRecipeById)

// Get saved recipes
router.get("/saved", protect, getSavedRecipes)

// Save a recipe
router.post("/saved", protect, saveRecipe)

// Remove a saved recipe
router.delete("/saved/:id", protect, removeSavedRecipe)

// Reorder saved recipes
router.put("/saved/reorder", protect, reorderSavedRecipes)

module.exports = router

