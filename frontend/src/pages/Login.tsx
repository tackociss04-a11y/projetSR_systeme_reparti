import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'client' | 'reparateur'>('client')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation simple
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    // Simulation d'authentification (à remplacer par un vrai backend plus tard)
    // Pour l'instant, on stocke dans localStorage
    const user = {
      email,
      role,
      nom: role === 'client' ? 'Client Test' : 'Réparateur Test',
    }

    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('isAuthenticated', 'true')

    // Redirection selon le rôle
    if (role === 'client') {
      navigate('/client')
    } else {
      navigate('/reparateur')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-brand-mark">T6</span>
          <h1>Connexion</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="role">Je suis</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'client' ? 'active' : ''}`}
                onClick={() => setRole('client')}
              >
                👤 Client
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'reparateur' ? 'active' : ''}`}
                onClick={() => setRole('reparateur')}
              >
                🔧 Réparateur
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Se connecter
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Pas encore de compte ?{' '}
            <a href="/register" className="auth-link">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

