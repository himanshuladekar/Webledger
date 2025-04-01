import axios from "axios"

const API_URL = "http://localhost:5000/api"

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
    throw error
  }
}

export const saveRecipe = async (recipeData) => {
  try {
    const response = await api.post("/recipes/saved", recipeData)
    return response.data
  } catch (error) {
    console.error("Error saving recipe:", error)
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

