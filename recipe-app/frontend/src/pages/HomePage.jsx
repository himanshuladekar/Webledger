"use client"

import { useState } from "react"
import SearchBar from "../components/SearchBar"
import RecipeCard from "../components/RecipeCard"
import { searchRecipes, saveRecipe } from "../services/api"
import { isAuthenticated } from "../services/auth"
import "../styles/HomePage.css"

const HomePage = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [savedRecipeIds, setSavedRecipeIds] = useState(new Set())

  const handleSearch = async (query) => {
    try {
      setLoading(true)
      setError(null)
      setSearchPerformed(true)
      const data = await searchRecipes(query)
      setRecipes(data.results || [])
    } catch (err) {
      setError("Failed to search recipes. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRecipe = async (recipe) => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = "/login"
      return
    }

    try {
      await saveRecipe({
        recipeId: recipe.id.toString(),
        title: recipe.title,
        image: recipe.image,
        sourceUrl: recipe.sourceUrl,
      })
      // Add to saved recipes locally
      setSavedRecipeIds((prev) => new Set([...prev, recipe.id.toString()]))
    } catch (err) {
      console.error("Error saving recipe:", err)
    }
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Find Your Next Favorite Recipe</h1>
        <p>Search thousands of recipes for any meal or occasion</p>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="recipes-section">
        {loading && <div className="loading">Searching for recipes...</div>}

        {error && <div className="error">{error}</div>}

        {!loading && searchPerformed && recipes.length === 0 && (
          <div className="no-results">No recipes found. Try another search.</div>
        )}

        {recipes.length > 0 && (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSave={handleSaveRecipe}
                isSaved={savedRecipeIds.has(recipe.id.toString())}
              />
            ))}
          </div>
        )}

        {!searchPerformed && !loading && (
          <div className="search-prompt">
            <p>Enter a keyword or ingredient above to start searching for recipes</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage

