"use client"

import { useState } from "react"
import "../styles/SearchBar.css"

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
    </div>
  )
}

export default SearchBar

