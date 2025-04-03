const SavedRecipe = require("../models/SavedRecipe")
const axios = require("axios")

// Search recipes via external API
// GET /api/recipes/search?query=
exports.searchRecipes = async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" })
    }

    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        query,
        number: 12,
        addRecipeInformation: true,
      },
    })

    res.json(response.data)
  } catch (error) {
    console.error("API error:", error.response ? error.response.data : error.message)
    res.status(500).json({
      message: "Error fetching recipes",
      error: error.response ? error.response.data : error.message,
    })
  }
}

// Get recipe details
// GET /api/recipes/:id
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params

    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
      },
    })

    res.json(response.data)
  } catch (error) {
    console.error("API error:", error.response ? error.response.data : error.message)
    res.status(500).json({
      message: "Error fetching recipe details",
      error: error.response ? error.response.data : error.message,
    })
  }
}

// Get saved recipes for a user
// GET /api/recipes/saved
exports.getSavedRecipes = async (req, res) => {
  try {
    const userId = req.user._id
    console.log("Getting saved recipes for user:", userId)

    let savedRecipes = await SavedRecipe.findOne({ user: userId })
    console.log("Found saved recipes:", savedRecipes)

    if (!savedRecipes) {
      // If no saved recipes document exists, create one
      savedRecipes = await SavedRecipe.create({
        user: userId,
        recipes: [],
      })
      console.log("Created new saved recipes document:", savedRecipes)
    }

    // Sort recipes by position before sending
    savedRecipes.recipes.sort((a, b) => a.position - b.position)

    res.json(savedRecipes.recipes)
  } catch (error) {
    console.error("Error getting saved recipes:", error)
    res.status(500).json({ message: error.message })
  }
}

// Save a recipe
// POST /api/recipes/saved
exports.saveRecipe = async (req, res) => {
  try {
    const userId = req.user._id
    console.log("Saving recipe for user:", userId)
    console.log("Recipe data:", req.body)

    const { recipeId, title, image, sourceUrl, isFavorite } = req.body

    if (!recipeId || !title) {
      return res.status(400).json({ message: "Recipe ID and title are required" })
    }

    let savedRecipes = await SavedRecipe.findOne({ user: userId })
    console.log("Found saved recipes document:", savedRecipes)

    if (!savedRecipes) {
      // If no saved recipes document exists, create one
      savedRecipes = await SavedRecipe.create({
        user: userId,
        recipes: [],
      })
      console.log("Created new saved recipes document:", savedRecipes)
    }

    // Check if recipe is already saved
    const existingRecipeIndex = savedRecipes.recipes.findIndex((recipe) => recipe.recipeId === recipeId)

    if (existingRecipeIndex !== -1) {
      // Update existing recipe if it's already saved
      console.log("Recipe already exists, updating favorite status")
      savedRecipes.recipes[existingRecipeIndex].isFavorite =
        isFavorite !== undefined ? isFavorite : savedRecipes.recipes[existingRecipeIndex].isFavorite
      await savedRecipes.save()
      console.log("Updated saved recipes:", savedRecipes.recipes)
      return res.status(200).json(savedRecipes.recipes)
    }

    // Add new recipe at the end of the list
    const position = savedRecipes.recipes.length

    savedRecipes.recipes.push({
      recipeId,
      title,
      image,
      sourceUrl,
      position,
      isFavorite: isFavorite || false,
    })

    await savedRecipes.save()
    console.log("Added new recipe, saved recipes now:", savedRecipes.recipes)

    res.status(201).json(savedRecipes.recipes)
  } catch (error) {
    console.error("Error saving recipe:", error)
    res.status(500).json({ message: error.message })
  }
}

// Toggle favorite status for a recipe
// PUT /api/recipes/saved/:id/favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id
    const recipeId = req.params.id
    const { isFavorite } = req.body

    console.log(`Toggling favorite for user ${userId}, recipe ${recipeId} to ${isFavorite}`)

    const savedRecipes = await SavedRecipe.findOne({ user: userId })

    if (!savedRecipes) {
      console.log("No saved recipes found for user")
      return res.status(404).json({ message: "No saved recipes found" })
    }

    const recipeIndex = savedRecipes.recipes.findIndex((r) => r.recipeId === recipeId)

    if (recipeIndex === -1) {
      console.log("Recipe not found in saved list")
      return res.status(404).json({ message: "Recipe not found in saved list" })
    }

    // Toggle favorite status
    console.log(`Setting favorite status from ${savedRecipes.recipes[recipeIndex].isFavorite} to ${isFavorite}`)
    savedRecipes.recipes[recipeIndex].isFavorite = isFavorite

    await savedRecipes.save()
    console.log("Saved recipes after toggle:", savedRecipes.recipes)

    res.json(savedRecipes.recipes)
  } catch (error) {
    console.error("Error toggling favorite:", error)
    res.status(500).json({ message: error.message })
  }
}

// Remove a saved recipe
// DELETE /api/recipes/saved/:id
exports.removeSavedRecipe = async (req, res) => {
  try {
    const userId = req.user._id
    const recipeId = req.params.id

    const savedRecipes = await SavedRecipe.findOne({ user: userId })

    if (!savedRecipes) {
      return res.status(404).json({ message: "No saved recipes found" })
    }

    // Find the position of the recipe to be removed
    const recipeIndex = savedRecipes.recipes.findIndex((r) => r.recipeId === recipeId)

    if (recipeIndex === -1) {
      return res.status(404).json({ message: "Recipe not found in saved list" })
    }

    // Remove the recipe
    const removedPosition = savedRecipes.recipes[recipeIndex].position
    savedRecipes.recipes.splice(recipeIndex, 1)

    // Update positions for recipes that were after the removed one
    savedRecipes.recipes.forEach((recipe) => {
      if (recipe.position > removedPosition) {
        recipe.position -= 1
      }
    })

    await savedRecipes.save()

    res.json(savedRecipes.recipes)
  } catch (error) {
    console.error("Error removing saved recipe:", error)
    res.status(500).json({ message: error.message })
  }
}

// Reorder saved recipes
// PUT /api/recipes/saved/reorder
exports.reorderSavedRecipes = async (req, res) => {
  try {
    const userId = req.user._id
    const { sourceIndex, destinationIndex } = req.body

    if (sourceIndex === undefined || destinationIndex === undefined) {
      return res.status(400).json({ message: "Source and destination indices are required" })
    }

    const savedRecipes = await SavedRecipe.findOne({ user: userId })

    if (!savedRecipes || !savedRecipes.recipes.length) {
      return res.status(404).json({ message: "No saved recipes found" })
    }

    // Sort recipes by position
    savedRecipes.recipes.sort((a, b) => a.position - b.position)

    // Get the recipe being moved
    const [movedRecipe] = savedRecipes.recipes.splice(sourceIndex, 1)

    // Insert it at the destination index
    savedRecipes.recipes.splice(destinationIndex, 0, movedRecipe)

    // Update all positions
    savedRecipes.recipes.forEach((recipe, index) => {
      recipe.position = index
    })

    await savedRecipes.save()

    res.json(savedRecipes.recipes)
  } catch (error) {
    console.error("Error reordering saved recipes:", error)
    res.status(500).json({ message: error.message })
  }
}

// Get favorite recipes
// GET /api/recipes/favorites
exports.getFavoriteRecipes = async (req, res) => {
  try {
    const userId = req.user._id
    console.log("Getting favorite recipes for user:", userId)

    const savedRecipes = await SavedRecipe.findOne({ user: userId })
    console.log("Found saved recipes:", savedRecipes)

    if (!savedRecipes) {
      console.log("No saved recipes found, returning empty array")
      return res.json([])
    }

    // Filter and sort favorite recipes
    const favoriteRecipes = savedRecipes.recipes
      .filter((recipe) => recipe.isFavorite)
      .sort((a, b) => a.position - b.position)

    console.log("Filtered favorite recipes:", favoriteRecipes)

    res.json(favoriteRecipes)
  } catch (error) {
    console.error("Error getting favorite recipes:", error)
    res.status(500).json({ message: error.message })
  }
}

