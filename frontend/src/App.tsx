import type { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientPage from './pages/ClientPage'
import ReparateurPage from './pages/ReparateurPage'
import './App.css'

function PrivateRoute({ children, requiredRole }: { children: JSX.Element; requiredRole?: 'client' | 'reparateur' }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Rediriger vers la page appropriée selon le rôle
    if (user.role === 'client') {
      return <Navigate to="/client" replace />
    } else if (user.role === 'reparateur') {
      return <Navigate to="/reparateur" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/client"
          element={
            <PrivateRoute requiredRole="client">
              <ClientPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reparateur"
          element={
            <PrivateRoute requiredRole="reparateur">
              <ReparateurPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
