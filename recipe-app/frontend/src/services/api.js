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
    const response = await api.get("/recipes/saved")
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
    const response = await api.get("/recipes/favorites")
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
    const response = await api.post("/recipes/saved", recipeData)
    // Dispatch an event to notify that a recipe was saved
    window.dispatchEvent(new CustomEvent("recipe-saved", { detail: response.data }))
    return response.data
  } catch (error) {
    console.error("Error saving recipe:", error)
    if (error.response && error.response.status === 400 && error.response.data.message === "Recipe already saved") {
      // If recipe is already saved, just return success
      return { success: true, message: "Recipe already saved" }
    }
    throw error
  }
}

export const toggleFavorite = async (recipeId, isFavorite) => {
  try {
    const response = await api.put(`/recipes/saved/${recipeId}/favorite`, { isFavorite })
    // Dispatch an event to notify that a recipe's favorite status was changed
    window.dispatchEvent(new CustomEvent("favorite-toggled", { detail: response.data }))
    return response.data
  } catch (error) {
    console.error("Error toggling favorite status:", error)
    throw error
  }
}

export const removeSavedRecipe = async (recipeId) => {
  try {
    const response = await api.delete(`/recipes/saved/${recipeId}`)
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

