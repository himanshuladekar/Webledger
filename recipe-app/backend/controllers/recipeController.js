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

    let savedRecipes = await SavedRecipe.findOne({ user: userId })

    if (!savedRecipes) {
      // If no saved recipes document exists, create one
      savedRecipes = await SavedRecipe.create({
        user: userId,
        recipes: [],
      })
    }

    // Sort recipes by position before sending
    savedRecipes.recipes.sort((a, b) => a.position - b.position)

    res.json(savedRecipes.recipes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Save a recipe
// POST /api/recipes/saved
exports.saveRecipe = async (req, res) => {
  try {
    const userId = req.user._id
    const { recipeId, title, image, sourceUrl } = req.body

    if (!recipeId || !title) {
      return res.status(400).json({ message: "Recipe ID and title are required" })
    }

    let savedRecipes = await SavedRecipe.findOne({ user: userId })

    if (!savedRecipes) {
      // If no saved recipes document exists, create one
      savedRecipes = await SavedRecipe.create({
        user: userId,
        recipes: [],
      })
    }

    // Check if recipe is already saved
    const recipeExists = savedRecipes.recipes.some((recipe) => recipe.recipeId === recipeId)

    if (recipeExists) {
      return res.status(400).json({ message: "Recipe already saved" })
    }

    // Add new recipe at the end of the list
    const position = savedRecipes.recipes.length

    savedRecipes.recipes.push({
      recipeId,
      title,
      image,
      sourceUrl,
      position,
    })

    await savedRecipes.save()

    res.status(201).json(savedRecipes.recipes)
  } catch (error) {
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
    res.status(500).json({ message: error.message })
  }
}

