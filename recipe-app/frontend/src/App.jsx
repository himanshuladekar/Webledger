import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { isAuthenticated } from "./services/auth"
import Header from "./components/Header"
import HomePage from "./pages/HomePage"
import RecipeDetailPage from "./pages/RecipeDetailPage"
import SavedRecipesPage from "./pages/SavedRecipesPage"
import FavoritesPage from "./pages/FavoritesPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import "./styles/App.css"

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />
  }
  return children
}

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedRecipesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Recipe Finder</p>
        </footer>
      </div>
    </Router>
  )
}

export default App

