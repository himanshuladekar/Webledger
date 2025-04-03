import axios from "axios"

const API_URL = "https://webledger-1.onrender.com/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// API service functions
export const searchRecipes = async (query) => {
  try {
    const response = await api.get(`/recipes/search?query=${query}`)
    return response.data
  } catch (error) {
    console.error("Error searching recipes:", error)
    throw error
  }
}

export const getRecipeById = async (id) => {
  try {
    const response = await api.get(`/recipes/${id}`)
    return response.data
  } catch (error) {
    console.error("Error getting recipe details:", error)
    throw error
  }
}

export const getSavedRecipes = async () => {
  try {
    console.log("Fetching saved recipes")
    const response = await api.get("/recipes/saved")
    console.log("Saved recipes response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error getting saved recipes:", error)
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token and return empty array
      localStorage.removeItem("userToken")
      localStorage.removeItem("userInfo")
    }
    return []
  }
}

export const getFavoriteRecipes = async () => {
  try {
    console.log("Fetching favorite recipes")
    const response = await api.get("/recipes/favorites")
    console.log("Favorite recipes response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error getting favorite recipes:", error)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("userToken")
      localStorage.removeItem("userInfo")
    }
    return []
  }
}

export const saveRecipe = async (recipeData) => {
  try {
    console.log("Saving recipe:", recipeData)
    const response = await api.post("/recipes/saved", recipeData)
    console.log("Save recipe response:", response.data)

    // Create a custom event with the response data
    const event = new CustomEvent("recipe-saved", {
      detail: response.data,
    })
    window.dispatchEvent(event)

    return response.data
  } catch (error) {
    console.error("Error saving recipe:", error)
    throw error
  }
}

export const toggleFavorite = async (recipeId, isFavorite) => {
  try {
    console.log(`Toggling favorite for recipe ${recipeId} to ${isFavorite}`)
    const response = await api.put(`/recipes/saved/${recipeId}/favorite`, { isFavorite })
    console.log("Toggle favorite response:", response.data)

    // Create a custom event with the response data
    const event = new CustomEvent("favorite-toggled", {
      detail: response.data,
    })
    window.dispatchEvent(event)

    return response.data
  } catch (error) {
    console.error("Error toggling favorite status:", error)
    throw error
  }
}

export const removeSavedRecipe = async (recipeId) => {
  try {
    console.log("Removing saved recipe:", recipeId)
    const response = await api.delete(`/recipes/saved/${recipeId}`)
    console.log("Remove recipe response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error removing saved recipe:", error)
    throw error
  }
}

export const reorderSavedRecipes = async (sourceIndex, destinationIndex) => {
  try {
    const response = await api.put("/recipes/saved/reorder", {
      sourceIndex,
      destinationIndex,
    })
    return response.data
  } catch (error) {
    console.error("Error reordering saved recipes:", error)
    throw error
  }
}

export default api

