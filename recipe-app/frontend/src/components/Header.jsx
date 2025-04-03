"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getUserInfo, logout } from "../services/auth"
import "../styles/Header.css"

const Header = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userInfo = getUserInfo()
    setUser(userInfo)

    // Add event listener for login/register
    const handleUserLogin = () => {
      const updatedUserInfo = getUserInfo()
      setUser(updatedUserInfo)
    }

    window.addEventListener("user-login", handleUserLogin)

    // Cleanup
    return () => {
      window.removeEventListener("user-login", handleUserLogin)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/login")
  }

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Cookbook Compass</Link>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/saved">My Recipes</Link>
              </li>
              <li>
                <Link to="/favorites">Favorites</Link>
              </li>
              <li>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Header

