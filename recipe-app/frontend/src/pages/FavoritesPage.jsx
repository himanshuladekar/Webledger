"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import RecipeCard from "../components/RecipeCard"
import { getFavoriteRecipes, toggleFavorite } from "../services/api"
import { isAuthenticated } from "../services/auth"
import "../styles/FavoritesPage.css"

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    fetchFavorites()

    // Listen for favorite toggle events
    const handleFavoriteToggled = () => {
      fetchFavorites()
    }

    window.addEventListener("favorite-toggled", handleFavoriteToggled)
    window.addEventListener("recipe-saved", handleFavoriteToggled)

    return () => {
      window.removeEventListener("favorite-toggled", handleFavoriteToggled)
      window.removeEventListener("recipe-saved", handleFavoriteToggled)
    }
  }, [navigate])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const data = await getFavoriteRecipes()
      setFavorites(data)
    } catch (err) {
      console.error("Error fetching favorites:", err)
      setError("Failed to load favorite recipes")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (recipeId) => {
    try {
      await toggleFavorite(recipeId, false)
      setFavorites(favorites.filter((recipe) => recipe.recipeId !== recipeId))
    } catch (err) {
      console.error("Error removing from favorites:", err)
    }
  }

  if (loading) {
    return <div className="loading">Loading favorite recipes...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (favorites.length === 0) {
    return (
      <div className="no-favorites">
        <div className="favorites-header">
          <h1>My Favorite Recipes</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">★</div>
          <h2>No favorite recipes yet</h2>
          <p>Mark recipes as favorites to find them quickly here</p>
          <Link to="/" className="browse-button">
            Browse Recipes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>My Favorite Recipes</h1>
        <p>Your most loved recipes in one place</p>
      </div>

      <div className="favorites-grid">
        {favorites.map((recipe) => (
          <div key={recipe.recipeId} className="favorite-item">
            <RecipeCard
              recipe={{
                id: recipe.recipeId,
                title: recipe.title,
                image: recipe.image,
                sourceUrl: recipe.sourceUrl,
                readyInMinutes: 0, // We don't have this info for saved recipes
              }}
              isSaved={true}
              isFavorite={true}
              showFavoriteButton={true}
            />
            <button className="remove-favorite" onClick={() => handleToggleFavorite(recipe.recipeId)}>
              Remove from Favorites
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FavoritesPage

