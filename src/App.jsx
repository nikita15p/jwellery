import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Customer from './pages/Customer'
import Admin from './pages/Admin'

export default function App(){
  return (
    <div>
      <Routes>
        <Route path="/jwellery/admin/*" element={<Admin/>} />
        <Route path="/jwellery/*" element={<Customer/>} />
      </Routes>
    </div>
  )
}
