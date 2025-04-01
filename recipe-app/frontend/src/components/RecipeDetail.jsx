"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getRecipeById, saveRecipe } from "../services/api"
import { isAuthenticated } from "../services/auth"
import "../styles/RecipeDetail.css"

const RecipeDetail = () => {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true)
        const data = await getRecipeById(id)
        setRecipe(data)
      } catch (err) {
        setError("Failed to load recipe details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
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
    } catch (err) {
      console.error("Error saving recipe:", err)
      if (err.response && err.response.status === 400 && err.response.data.message === "Recipe already saved") {
        setSaved(true)
      }
    } finally {
      setSaving(false)
    }
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
        <button className={`save-button ${saved ? "saved" : ""}`} onClick={handleSave} disabled={saving || saved}>
          {saving ? "Saving..." : saved ? "Saved" : "Save Recipe"}
        </button>
      </div>

      <div className="recipe-image">
        <img
          src={recipe.image || "/placeholder.svg"}
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

