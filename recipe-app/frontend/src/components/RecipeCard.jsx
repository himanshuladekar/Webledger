"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { isAuthenticated } from "../services/auth"
import { toggleFavorite } from "../services/api"
import "../styles/RecipeCard.css"

const RecipeCard = ({ recipe, onSave, isSaved, isFavorite, showFavoriteButton = true }) => {
  const [favorite, setFavorite] = useState(isFavorite || false)
  const [saving, setSaving] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSave(recipe)
  }

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated()) {
      alert("Please log in to add favorites")
      return
    }

    if (!isSaved) {
      // If not saved yet, save it first with favorite status
      onSave(recipe, true)
      setFavorite(true)
      return
    }

    try {
      setSaving(true)
      const newStatus = !favorite
      await toggleFavorite(recipe.id.toString(), newStatus)
      setFavorite(newStatus)
    } catch (err) {
      console.error("Error toggling favorite:", err)
    } finally {
      setSaving(false)
    }
  }

  // Ensure we have a valid image URL
  const imageUrl =
    recipe.image && recipe.image.startsWith("http") ? recipe.image : "https://via.placeholder.com/400x300?text=No+Image"

  return (
    <div className="recipe-card">
      <Link to={`/recipe/${recipe.id}`}>
        <div className="recipe-image">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={recipe.title}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "https://via.placeholder.com/400x300?text=No+Image"
            }}
          />
          {showFavoriteButton && (
            <button
              className={`favorite-button ${favorite ? "favorited" : ""}`}
              onClick={handleToggleFavorite}
              disabled={saving}
            >
              {favorite ? "★" : "☆"}
            </button>
          )}
        </div>
        <div className="recipe-info">
          <h3>{recipe.title}</h3>
          <div className="recipe-meta">
            <span className="ready-time">⏱️ {recipe.readyInMinutes} min</span>
            {recipe.vegetarian && <span className="tag vegetarian">Vegetarian</span>}
            {recipe.vegan && <span className="tag vegan">Vegan</span>}
            {recipe.glutenFree && <span className="tag gluten-free">Gluten Free</span>}
          </div>
        </div>
      </Link>
      {onSave && !isSaved && (
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
      )}
    </div>
  )
}

export default RecipeCard

