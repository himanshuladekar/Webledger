const express = require("express")
const router = express.Router()
const {
  searchRecipes,
  getRecipeById,
  getSavedRecipes,
  saveRecipe,
  removeSavedRecipe,
  reorderSavedRecipes,
  toggleFavorite,
  getFavoriteRecipes,
} = require("../controllers/recipeController")
const { protect } = require("../middleware/authMiddleware")

// Get favorite recipes
router.get("/favorites", protect, getFavoriteRecipes)

// Get saved recipes
router.get("/saved", protect, getSavedRecipes)

// Search recipes
router.get("/search", searchRecipes)

// Get recipe details
router.get("/:id", getRecipeById)

// Save a recipe
router.post("/saved", protect, saveRecipe)

// Toggle favorite status
router.put("/saved/:id/favorite", protect, toggleFavorite)

// Remove a saved recipe
router.delete("/saved/:id", protect, removeSavedRecipe)

// Reorder saved recipes
router.put("/saved/reorder", protect, reorderSavedRecipes)

module.exports = router

