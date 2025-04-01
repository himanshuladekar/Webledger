"use client"

import { Link } from "react-router-dom"
import "../styles/RecipeCard.css"

const RecipeCard = ({ recipe, onSave, isSaved }) => {
  const handleSave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSave(recipe)
  }

  return (
    <div className="recipe-card">
      <Link to={`/recipe/${recipe.id}`}>
        <div className="recipe-image">
          <img
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "https://th.bing.com/th/id/OIP.Kbmg2QoxCUsaVGNMkqZTwwHaE7?w=174&h=104&c=7&bgcl=ab44f4&r=0&o=6&dpr=1.3&pid=13.1"
            }}
          />
        </div>
        <div className="recipe-info">
          <h3>{recipe.title}</h3>
          <div className="recipe-meta">
            <span>Ready in {recipe.readyInMinutes} minutes</span>
            {recipe.vegetarian && <span className="tag vegetarian">Vegetarian</span>}
          </div>
        </div>
      </Link>
      {onSave && (
        <button className={`save-button ${isSaved ? "saved" : ""}`} onClick={handleSave} disabled={isSaved}>
          {isSaved ? "Saved" : "Save"}
        </button>
      )}
    </div>
  )
}

export default RecipeCard

