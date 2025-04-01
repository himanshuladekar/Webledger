import api from "./api"

export const register = async (username, password) => {
  try {
    const response = await api.post("/users/register", { username, password })
    if (response.data) {
      localStorage.setItem("userInfo", JSON.stringify(response.data))
      localStorage.setItem("userToken", response.data.token)
    }
    return response.data
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

export const login = async (username, password) => {
  try {
    const response = await api.post("/users/login", { username, password })
    if (response.data) {
      localStorage.setItem("userInfo", JSON.stringify(response.data))
      localStorage.setItem("userToken", response.data.token)
    }
    return response.data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem("userInfo")
  localStorage.removeItem("userToken")
}

export const getUserInfo = () => {
  const userInfo = localStorage.getItem("userInfo")
  return userInfo ? JSON.parse(userInfo) : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem("userToken")
}

