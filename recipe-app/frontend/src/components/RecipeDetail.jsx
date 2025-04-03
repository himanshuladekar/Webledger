"use client"

"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getRecipeById, saveRecipe, getSavedRecipes, toggleFavorite } from "../services/api"
import { isAuthenticated } from "../services/auth"
import "../styles/RecipeDetail.css"

const RecipeDetail = () => {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true)
        const data = await getRecipeById(id)
        setRecipe(data)

        // Check if recipe is already saved and if it's a favorite
        if (isAuthenticated()) {
          try {
            const savedRecipes = await getSavedRecipes()
            const savedRecipe = savedRecipes.find((r) => r.recipeId === id.toString())

            if (savedRecipe) {
              setSaved(true)
              setFavorite(savedRecipe.isFavorite || false)
            }
          } catch (err) {
            console.error("Error checking if recipe is saved:", err)
          }
        }
      } catch (err) {
        setError("Failed to load recipe details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()

    // Listen for recipe saved or favorite toggled events
    const handleRecipeSaved = () => {
      setSaved(true)
    }

    const handleFavoriteToggled = (event) => {
      if (event.detail && Array.isArray(event.detail)) {
        const savedRecipe = event.detail.find((r) => r.recipeId === id.toString())
        if (savedRecipe) {
          setFavorite(savedRecipe.isFavorite || false)
        }
      }
    }

    window.addEventListener("recipe-saved", handleRecipeSaved)
    window.addEventListener("favorite-toggled", handleFavoriteToggled)

    return () => {
      window.removeEventListener("recipe-saved", handleRecipeSaved)
      window.removeEventListener("favorite-toggled", handleFavoriteToggled)
    }
  }, [id])

  const handleSave = async () => {
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

      // Show success message
      showNotification("Recipe saved successfully!")
    } catch (err) {
      console.error("Error saving recipe:", err)
      if (err.response && err.response.status === 400 && err.response.data.message === "Recipe already saved") {
        setSaved(true)
        showNotification("This recipe is already in your saved recipes.")
      } else {
        showNotification("Failed to save recipe. Please try again.", "error")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleFavorite = async () => {
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
        showNotification("Recipe added to favorites!")
      } catch (err) {
        console.error("Error saving recipe as favorite:", err)
        showNotification("Failed to add to favorites. Please try again.", "error")
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
      showNotification("Failed to update favorite status. Please try again.", "error")
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

  if (loading) {
    return <div className="loading">Loading recipe details...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!recipe) {
    return <div className="error">Recipe not found</div>
  }

  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <h1>{recipe.title}</h1>
        <div className="recipe-actions">
          <button
            className={`favorite-button ${favorite ? "favorited" : ""}`}
            onClick={handleToggleFavorite}
            disabled={saving}
          >
            {favorite ? "★ Favorited" : "☆ Add to Favorites"}
          </button>

          {!saved && (
            <button className="save-button" onClick={handleSave} disabled={saving || saved}>
              {saving ? "Saving..." : "Save Recipe"}
            </button>
          )}
        </div>
      </div>

      <div className="recipe-image">
        <img
          src={recipe.image || "https://via.placeholder.com/600x400?text=No+Image"}
          alt={recipe.title}
          onError={(e) => {
            e.target.onerror = null
            e.target.src = "https://via.placeholder.com/600x400?text=No+Image"
          }}
        />
      </div>

      <div className="recipe-meta">
        <div className="meta-item">
          <span className="meta-label">Ready in:</span>
          <span>{recipe.readyInMinutes} minutes</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Servings:</span>
          <span>{recipe.servings}</span>
        </div>
        {recipe.vegetarian && <div className="tag vegetarian">Vegetarian</div>}
        {recipe.vegan && <div className="tag vegan">Vegan</div>}
        {recipe.glutenFree && <div className="tag gluten-free">Gluten Free</div>}
      </div>

      <div className="recipe-summary">
        <h2>Summary</h2>
        <div dangerouslySetInnerHTML={{ __html: recipe.summary }} />
      </div>

      <div className="recipe-ingredients">
        <h2>Ingredients</h2>
        <ul>
          {recipe.extendedIngredients?.map((ingredient) => (
            <li key={ingredient.id}>{ingredient.original}</li>
          ))}
        </ul>
      </div>

      <div className="recipe-instructions">
        <h2>Instructions</h2>
        {recipe.instructions ? (
          <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
        ) : (
          <p>
            No instructions available. Visit the{" "}
            <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
              original source
            </a>{" "}
            for complete instructions.
          </p>
        )}
      </div>

      <div className="recipe-source">
        <p>
          <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
            View Original Recipe
          </a>
        </p>
      </div>
    </div>
  )
}

export default RecipeDetail

