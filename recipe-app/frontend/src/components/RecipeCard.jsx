"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { isAuthenticated } from "../services/auth"
import { saveRecipe, toggleFavorite } from "../services/api"
import "../styles/RecipeCard.css"

const RecipeCard = ({ recipe, isSaved: initialIsSaved, isFavorite: initialIsFavorite, showFavoriteButton = true }) => {
  const [favorite, setFavorite] = useState(initialIsFavorite || false)
  const [saved, setSaved] = useState(initialIsSaved || false)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  // Check saved status on mount and when recipe changes
  useEffect(() => {
    setSaved(initialIsSaved || false)
    setFavorite(initialIsFavorite || false)

    // Listen for recipe saved and favorite toggled events
    const handleRecipeSaved = (event) => {
      if (event.detail && Array.isArray(event.detail)) {
        const savedRecipe = event.detail.find((r) => r.recipeId === recipe.id.toString())
        if (savedRecipe) {
          setSaved(true)
          setFavorite(savedRecipe.isFavorite || false)
        }
      }
    }

    window.addEventListener("recipe-saved", handleRecipeSaved)
    window.addEventListener("favorite-toggled", handleRecipeSaved)

    return () => {
      window.removeEventListener("recipe-saved", handleRecipeSaved)
      window.removeEventListener("favorite-toggled", handleRecipeSaved)
    }
  }, [recipe.id, initialIsSaved, initialIsFavorite])

  const handleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    try {
      setSaving(true)
      await saveRecipe({
        recipeId: recipe.id.toString(),
        title: recipe.title,
        image: recipe.image,
        sourceUrl: recipe.sourceUrl,
      })
      setSaved(true)
      showNotification("Recipe saved successfully!")
    } catch (err) {
      console.error("Error saving recipe:", err)
      showNotification("Failed to save recipe", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    if (!saved) {
      // If not saved yet, save it first with favorite status
      try {
        setSaving(true)
        await saveRecipe({
          recipeId: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          sourceUrl: recipe.sourceUrl,
          isFavorite: true,
        })
        setSaved(true)
        setFavorite(true)
        showNotification("Added to favorites!")
      } catch (err) {
        console.error("Error saving as favorite:", err)
        showNotification("Failed to add to favorites", "error")
      } finally {
        setSaving(false)
      }
      return
    }

    try {
      setSaving(true)
      const newStatus = !favorite
      await toggleFavorite(recipe.id.toString(), newStatus)
      setFavorite(newStatus)
      showNotification(newStatus ? "Added to favorites!" : "Removed from favorites")
    } catch (err) {
      console.error("Error toggling favorite:", err)
      showNotification("Failed to update favorite status", "error")
    } finally {
      setSaving(false)
    }
  }

  const showNotification = (message, type = "success") => {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    // Add to document
    document.body.appendChild(notification)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add("hide")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
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
            {recipe.readyInMinutes && <span className="ready-time">⏱️ {recipe.readyInMinutes} min</span>}
            {recipe.vegetarian && <span className="tag vegetarian">Vegetarian</span>}
            {recipe.vegan && <span className="tag vegan">Vegan</span>}
            {recipe.glutenFree && <span className="tag gluten-free">Gluten Free</span>}
          </div>
        </div>
      </Link>
      {!saved && (
        <button className="save-button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      )}
    </div>
  )
}

export default RecipeCard

