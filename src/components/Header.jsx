import React from 'react'
import { Link } from 'react-router-dom'

export default function Header({categories, onSearch, onSelectCategory}){
  return (
    <header className="topbar">
      <div className="brand">
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="#">Shop By Category</Link>
        </nav>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <input placeholder="Search" className="search" onChange={(e)=>onSearch(e.target.value)} />
        <div className="icons">
          <Link to="/admin">Login</Link>
          <Link to="#">🔍</Link>
          <Link to="#">🛒</Link>
        </div>
      </div>
    </header>
  )
}
