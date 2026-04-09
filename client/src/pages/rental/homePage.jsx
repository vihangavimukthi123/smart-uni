import React from 'react'
import Header from './components/header'
import { Route, Routes } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="app-shell">
        <Header/>
        <div className="w-full min-h-[calc(10%-100px)] overflow-y-scroll">
          <Routes>
            <Route index element={<h1>Home Page</h1>}/>
            <Route path='product' element={<h1>Products</h1>}/>
            <Route path='about' element={<h1>About</h1>}/>
            <Route path='contact' element={<h1>Contact</h1>}/>
            <Route path='*' element={<h1>Page not found</h1>}/>
          </Routes>

        </div>
      
    </div>
  )
}

