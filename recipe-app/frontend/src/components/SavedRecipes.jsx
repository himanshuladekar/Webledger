"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DragDropContext } from '@hello-pangea/dnd'
import { getSavedRecipes, removeSavedRecipe, reorderSavedRecipes } from "../services/api"
import "../styles/SavedRecipes.css"

const SavedRecipes = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSavedRecipes()
  }, [])

  const fetchSavedRecipes = async () => {
    try {
      setLoading(true)
      const data = await getSavedRecipes()
      setRecipes(data)
    } catch (err) {
      setError("Failed to load saved recipes")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (recipeId) => {
    try {
      await removeSavedRecipe(recipeId)
      setRecipes(recipes.filter((recipe) => recipe.recipeId !== recipeId))
    } catch (err) {
      console.error("Error removing recipe:", err)
    }
  }

  const handleDragEnd = async (result) => {
    // Dropped outside the list
    if (!result.destination) {
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    // If position didn't change
    if (sourceIndex === destinationIndex) {
      return
    }

    // Reorder locally first for responsiveness
    const reorderedRecipes = [...recipes]
    const [removed] = reorderedRecipes.splice(sourceIndex, 1)
    reorderedRecipes.splice(destinationIndex, 0, removed)

    // Update positions for UI
    reorderedRecipes.forEach((recipe, index) => {
      recipe.position = index
    })

    setRecipes(reorderedRecipes)

    // Then update on the backend
    try {
      await reorderSavedRecipes(sourceIndex, destinationIndex)
    } catch (err) {
      console.error("Error reordering recipes:", err)
      // If there's an error, fetch the recipes again to ensure UI is in sync
      fetchSavedRecipes()
    }
  }

  if (loading) {
    return <div className="loading">Loading saved recipes...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (recipes.length === 0) {
    return (
      <div className="no-saved-recipes">
        <h2>You haven't saved any recipes yet</h2>
        <p>Search for recipes and click "Save" to add them to your collection.</p>
        <Link to="/" className="search-button">
          Search Recipes
        </Link>
      </div>
    )
  }

  return (
    <div className="saved-recipes">
      <h2>My Saved Recipes</h2>
      <p className="drag-instructions">Drag and drop to reorder your recipes</p>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="saved-recipes-list">
          {(provided) => (
            <div className="saved-recipes-list" {...provided.droppableProps} ref={provided.innerRef}>
              {recipes.map((recipe, index) => (
                <Draggable key={recipe.recipeId} draggableId={recipe.recipeId} index={index}>
                  {(provided) => (
                    <div
                      className="saved-recipe-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="recipe-handle">
                        <div className="drag-icon">☰</div>
                      </div>
                      <div className="recipe-image">
                        <img
                          src={recipe.image || "https://via.placeholder.com/100?text=No+Image"}
                          alt={recipe.title}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "https://via.placeholder.com/100?text=No+Image"
                          }}
                        />
                      </div>
                      <div className="recipe-info">
                        <h3>
                          <Link to={`/recipe/${recipe.recipeId}`}>{recipe.title}</Link>
                        </h3>
                      </div>
                      <div className="recipe-actions">
                        <button className="remove-button" onClick={() => handleRemove(recipe.recipeId)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default SavedRecipes

