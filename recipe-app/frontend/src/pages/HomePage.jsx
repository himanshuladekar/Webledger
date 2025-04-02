"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SearchBar from "../components/SearchBar"
import RecipeCard from "../components/RecipeCard"
import { searchRecipes, saveRecipe, getSavedRecipes } from "../services/api"
import { isAuthenticated } from "../services/auth"
import "../styles/HomePage.css"

const popularSearches = [
  "pasta",
  "chicken",
  "vegetarian",
  "dessert",
  "breakfast",
  "quick",
  "healthy",
  "soup",
  "salad",
  "baking",
]

const featuredCategories = [
  { name: "Quick & Easy", image: "https://th.bing.com/th/id/OIP.J0IJK5sgC_Wbu5F_VqV28wHaMi?pid=ImgDet&w=178&h=301&c=7&dpr=1.3", query: "quick easy" },
  { name: "Healthy", image: "https://th.bing.com/th/id/OIP.0yxXBfKOO0f9d18hdSDQHgHaE8?w=290&h=193&c=7&r=0&o=5&dpr=1.3&pid=1.7", query: "healthy" },
  { name: "Vegetarian", image: "https://th.bing.com/th/id/OIP.73PiizCPMdrXPaQivowJpgHaE8?w=252&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7", query: "vegetarian" },
  { name: "Desserts", image: "https://th.bing.com/th/id/OIP.UP_XBprUBcd2LUqDUfXfoAHaGC?w=237&h=193&c=7&r=0&o=5&dpr=1.3&pid=1.7", query: "dessert" },
]

const HomePage = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [savedRecipeIds, setSavedRecipeIds] = useState(new Set())
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState(new Set())
  const [currentQuery, setCurrentQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Check for saved recipes if user is authenticated
    const checkSavedRecipes = async () => {
      if (isAuthenticated()) {
        try {
          const savedRecipes = await getSavedRecipes()
          const savedIds = new Set(savedRecipes.map((recipe) => recipe.recipeId))
          setSavedRecipeIds(savedIds)

          // Also track favorite recipes
          const favoriteIds = new Set(
            savedRecipes.filter((recipe) => recipe.isFavorite).map((recipe) => recipe.recipeId),
          )
          setFavoriteRecipeIds(favoriteIds)
        } catch (err) {
          console.error("Error fetching saved recipes:", err)
        }
      }
    }

    checkSavedRecipes()

    // Listen for recipe saved events
    const handleRecipeSaved = (event) => {
      const savedRecipes = event.detail
      if (Array.isArray(savedRecipes)) {
        const savedIds = new Set(savedRecipes.map((recipe) => recipe.recipeId))
        setSavedRecipeIds(savedIds)

        const favoriteIds = new Set(savedRecipes.filter((recipe) => recipe.isFavorite).map((recipe) => recipe.recipeId))
        setFavoriteRecipeIds(favoriteIds)
      }
    }

    window.addEventListener("recipe-saved", handleRecipeSaved)
    window.addEventListener("favorite-toggled", handleRecipeSaved)

    return () => {
      window.removeEventListener("recipe-saved", handleRecipeSaved)
      window.removeEventListener("favorite-toggled", handleRecipeSaved)
    }
  }, [])

  const handleSearch = async (query) => {
    try {
      setLoading(true)
      setError(null)
      setSearchPerformed(true)
      setCurrentQuery(query)
      const data = await searchRecipes(query)
      setRecipes(data.results || [])
    } catch (err) {
      setError("Failed to search recipes. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRecipe = async (recipe, setAsFavorite = false) => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      navigate("/login")
      return
    }

    try {
      await saveRecipe({
        recipeId: recipe.id.toString(),
        title: recipe.title,
        image: recipe.image,
        sourceUrl: recipe.sourceUrl,
        isFavorite: setAsFavorite,
      })

      // Add to saved recipes locally
      setSavedRecipeIds((prev) => new Set([...prev, recipe.id.toString()]))

      // If marked as favorite, add to favorites locally
      if (setAsFavorite) {
        setFavoriteRecipeIds((prev) => new Set([...prev, recipe.id.toString()]))
      }
    } catch (err) {
      console.error("Error saving recipe:", err)
    }
  }

  const handleCategoryClick = (query) => {
    handleSearch(query)
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Discover Delicious Recipes</h1>
        <p>Find and save your favorite recipes for any meal or occasion</p>
        <SearchBar onSearch={handleSearch} />

        <div className="popular-searches">
          <p>Popular searches:</p>
          <div className="search-tags">
            {popularSearches.map((term) => (
              <button key={term} className="search-tag" onClick={() => handleSearch(term)}>
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!searchPerformed && !loading && (
        <div className="featured-categories">
          <h2>Explore Recipe Categories</h2>
          <div className="category-grid">
            {featuredCategories.map((category) => (
              <div key={category.name} className="category-card" onClick={() => handleCategoryClick(category.query)}>
                <div className="category-image">
                  <img src={category.image || "/placeholder.svg"} alt={category.name} />
                </div>
                <h3>{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="recipes-section">
        {loading && <div className="loading">Searching for recipes...</div>}

        {error && <div className="error">{error}</div>}

        {!loading && searchPerformed && recipes.length === 0 && (
          <div className="no-results">No recipes found for "{currentQuery}". Try another search.</div>
        )}

        {recipes.length > 0 && (
          <>
            <h2 className="search-results-title">
              {currentQuery ? `Results for "${currentQuery}"` : "Popular Recipes"}
            </h2>
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSave={handleSaveRecipe}
                  isSaved={savedRecipeIds.has(recipe.id.toString())}
                  isFavorite={favoriteRecipeIds.has(recipe.id.toString())}
                />
              ))}
            </div>
          </>
        )}

        {!searchPerformed && !loading && (
          <div className="cooking-tips">
            <h2>Cooking Tips</h2>
            <div className="tips-grid">
              <div className="tip-card">
                <h3>Meal Prep Like a Pro</h3>
                <p>
                  Save time by prepping ingredients in advance. Chop vegetables, marinate proteins, and portion
                  ingredients for quick and easy cooking during the week.
                </p>
              </div>
              <div className="tip-card">
                <h3>Perfect Your Seasoning</h3>
                <p>
                  Season in layers as you cook, not just at the end. Taste and adjust seasonings throughout the cooking
                  process for more flavorful dishes.
                </p>
              </div>
              <div className="tip-card">
                <h3>Master Kitchen Organization</h3>
                <p>
                  Keep your most-used tools and ingredients within easy reach. A well-organized kitchen makes cooking
                  more efficient and enjoyable.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage

