import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'reparateur',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
    validateField(field, formData[field as keyof typeof formData])
  }

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'nom':
        if (!value.trim()) {
          newErrors.nom = 'Le nom est obligatoire'
        }
        break
      case 'prenom':
        if (!value.trim()) {
          newErrors.prenom = 'Le prénom est obligatoire'
        }
        break
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'L\'email est obligatoire'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Format d\'email invalide'
        }
        break
      case 'telephone':
        if (!value.trim()) {
          newErrors.telephone = 'Le téléphone est obligatoire'
        } else if (!/^[0-9+\s-]+$/.test(value)) {
          newErrors.telephone = 'Format de téléphone invalide'
        }
        break
      case 'password':
        if (!value) {
          newErrors.password = 'Le mot de passe est obligatoire'
        } else if (value.length < 6) {
          newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
        }
        break
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe'
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
        }
        break
    }

    setErrors(newErrors)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valider tous les champs
    Object.keys(formData).forEach((field) => {
      if (field !== 'adresse') {
        validateField(field, formData[field as keyof typeof formData])
      }
    })

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(errors).some((error) => error !== '')
    if (hasErrors) {
      return
    }

    // Validation finale
    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone || !formData.password) {
      setErrors({ general: 'Veuillez remplir tous les champs obligatoires' })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' })
      return
    }

    if (formData.password.length < 6) {
      setErrors({ password: 'Le mot de passe doit contenir au moins 6 caractères' })
      return
    }

    // Simulation d'inscription
    const user = {
      email: formData.email,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      adresse: formData.adresse,
      role: formData.role,
    }

    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('isAuthenticated', 'true')

    // Redirection selon le rôle
    if (formData.role === 'client') {
      navigate('/client')
    } else {
      navigate('/reparateur')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <div className="auth-header">
          <span className="auth-brand-mark">T6</span>
          <h1>Créer un compte</h1>
          <p>Rejoignez T6 All-in-One Services</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form register-form">
          {errors.general && <div className="error-message">{errors.general}</div>}

          {/* Section 1: Type de compte */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-number">1</span>
              Type de compte
            </h3>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'client' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'client' })}
              >
                <span className="role-icon">👤</span>
                <div>
                  <div className="role-name">Client</div>
                  <div className="role-desc">Suivre mes réparations</div>
                </div>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'reparateur' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'reparateur' })}
              >
                <span className="role-icon">🔧</span>
                <div>
                  <div className="role-name">Réparateur</div>
                  <div className="role-desc">Gérer l'atelier</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Informations personnelles */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-number">2</span>
              Informations personnelles
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nom">
                  Nom <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  onBlur={() => handleBlur('nom')}
                  placeholder="Votre nom"
                  className={touched.nom && errors.nom ? 'error' : ''}
                  required
                />
                {touched.nom && errors.nom && (
                  <span className="field-error">{errors.nom}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="prenom">
                  Prénom <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  onBlur={() => handleBlur('prenom')}
                  placeholder="Votre prénom"
                  className={touched.prenom && errors.prenom ? 'error' : ''}
                  required
                />
                {touched.prenom && errors.prenom && (
                  <span className="field-error">{errors.prenom}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="votre@email.com"
                  className={touched.email && errors.email ? 'error' : ''}
                  required
                />
                {touched.email && errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telephone">
                  Téléphone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('telephone')}
                  placeholder="+221 77 000 00 00"
                  className={touched.telephone && errors.telephone ? 'error' : ''}
                  required
                />
                {touched.telephone && errors.telephone && (
                  <span className="field-error">{errors.telephone}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="adresse">Adresse</label>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Votre adresse complète (optionnel)"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Sécurité */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-number">3</span>
              Sécurité
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password">
                  Mot de passe <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={touched.password && errors.password ? 'error' : ''}
                  required
                />
                {touched.password && errors.password && (
                  <span className="field-error">{errors.password}</span>
                )}
                <small className="field-hint">Minimum 6 caractères</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirmer le mot de passe <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••••"
                  className={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}
                  required
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Créer mon compte
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Déjà un compte ?{' '}
            <a href="/login" className="auth-link">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
