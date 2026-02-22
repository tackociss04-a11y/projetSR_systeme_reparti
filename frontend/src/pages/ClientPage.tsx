import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ClientPage.css'

type TicketStatus =
  | 'recu'
  | 'diagnostic'
  | 'attente_piece'
  | 'en_reparation'
  | 'termine'

const API_BASE_URL = 'http://localhost:5000/api'

export default function ClientPage() {
  const [activeTab, setActiveTab] = useState<'request' | 'tracking'>('request')
  const [clientInfo, setClientInfo] = useState<any>(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  // Récupérer les tickets du client au chargement
  useEffect(() => {
    const loadClientTickets = async () => {
      if (!user.email) return

      try {
        const response = await fetch(`${API_BASE_URL}/client/tickets?email=${encodeURIComponent(user.email)}`)
        const data = await response.json()

        if (response.ok && data.client) {
          setClientInfo(data.client)
          
          // Stocker le dernier code de suivi dans localStorage
          if (data.tickets && data.tickets.length > 0) {
            const lastTicket = data.tickets[0]
            localStorage.setItem('client_tracking_code', lastTicket.code_suivi)
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des tickets:', err)
      }
    }

    loadClientTickets()
  }, [user.email])

  // Récupérer le code depuis localStorage au chargement
  const savedCode = localStorage.getItem('client_tracking_code') || ''

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    // Ne pas supprimer le code de suivi pour qu'il reste après reconnexion
    navigate('/')
  }

  return (
    <div className="client-page">
      <header className="client-header">
        <div className="client-brand">
          <span className="client-brand-mark">T6</span>
          <span className="client-brand-text">All-in-One Services</span>
        </div>
        <div className="client-user">
          <div className="client-user-info">
            <span className="client-user-icon">📞</span>
            <div className="client-user-details">
              <span className="client-user-name">{user.prenom} {user.nom}</span>
              <span className="client-user-role">Client</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>

      {/* Bandeau avec code de suivi toujours visible */}
      {savedCode && (
        <div className="tracking-banner">
          <div className="tracking-banner-content">
            <span className="tracking-banner-label">📋 Votre code de suivi :</span>
            <span className="tracking-banner-code">{savedCode}</span>
            <button
              onClick={() => {
                setActiveTab('tracking')
                // Auto-remplir le code dans le tracking
                const trackingInput = document.querySelector('.tracking-input') as HTMLInputElement
                if (trackingInput) {
                  trackingInput.value = savedCode
                }
              }}
              className="btn-track-now"
            >
              Suivre maintenant
            </button>
          </div>
        </div>
      )}

      <nav className="client-nav">
        <button
          className={activeTab === 'request' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('request')}
        >
          📝 Nouvelle Réparation
        </button>
        <button
          className={activeTab === 'tracking' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('tracking')}
        >
          🔍 Suivre ma Réparation
        </button>
      </nav>

      <main className="client-main">
        {activeTab === 'request' && <ClientRequestForm clientInfo={clientInfo} />}
        {activeTab === 'tracking' && <ClientTracking savedCode={savedCode} />}
      </main>
    </div>
  )
}

function ClientRequestForm({ clientInfo }: { clientInfo: any }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  const [form, setForm] = useState({
    nom: clientInfo?.nom || user.nom || '',
    prenom: clientInfo?.prenom || user.prenom || '',
    adresse: clientInfo?.adresse || '',
    email: clientInfo?.email || user.email || '',
    telephone: clientInfo?.telephone || user.telephone || '',
    type_appareil: 'ordinateur',
    marque: '',
    modele: '',
    numero_serie: '',
    description_panne: '',
    urgence_entreprise: false,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ code_suivi: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mettre à jour le formulaire quand clientInfo change
  useEffect(() => {
    if (clientInfo) {
      setForm(prev => ({
        ...prev,
        nom: clientInfo.nom || prev.nom,
        prenom: clientInfo.prenom || prev.prenom,
        adresse: clientInfo.adresse || prev.adresse,
        email: clientInfo.email || prev.email,
        telephone: clientInfo.telephone || prev.telephone,
      }))
    }
  }, [clientInfo])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création du ticket')
      }

      setResult(data)
      
      // Stocker le code de suivi dans localStorage
      if (data.code_suivi) {
        localStorage.setItem('client_tracking_code', data.code_suivi)
        // Recharger la page pour afficher le nouveau code dans le bandeau
        window.location.reload()
      }
      
      // Réinitialiser seulement les champs de l'appareil, garder les infos client
      setForm(prev => ({
        ...prev,
        type_appareil: 'ordinateur',
        marque: '',
        modele: '',
        numero_serie: '',
        description_panne: '',
        urgence_entreprise: false,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="client-form-container">
      <h2>Nouvelle Demande de Réparation</h2>
      <form onSubmit={handleSubmit} className="client-form">
        <div className="form-section">
          <h3>Informations Personnelles</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Nom *</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
                readOnly={!!clientInfo?.nom}
                style={clientInfo?.nom ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
              />
              {clientInfo?.nom && <small className="field-note">✓ Pré-rempli depuis votre compte</small>}
            </div>
            <div className="form-field">
              <label>Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
                readOnly={!!clientInfo?.prenom}
                style={clientInfo?.prenom ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
              />
              {clientInfo?.prenom && <small className="field-note">✓ Pré-rempli depuis votre compte</small>}
            </div>
            <div className="form-field">
              <label>Téléphone *</label>
              <input
                type="tel"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                required
                readOnly={!!clientInfo?.telephone}
                style={clientInfo?.telephone ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
              />
              {clientInfo?.telephone && <small className="field-note">✓ Pré-rempli depuis votre compte</small>}
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                readOnly={!!clientInfo?.email}
                style={clientInfo?.email ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}}
              />
              {clientInfo?.email && <small className="field-note">✓ Pré-rempli depuis votre compte</small>}
            </div>
            <div className="form-field full-width">
              <label>Adresse</label>
              <input
                type="text"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Informations de l'Appareil</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Type d'appareil *</label>
              <select
                name="type_appareil"
                value={form.type_appareil}
                onChange={handleChange}
                required
              >
                <option value="ordinateur">Ordinateur</option>
                <option value="telephone">Téléphone</option>
              </select>
            </div>
            <div className="form-field">
              <label>Marque *</label>
              <input
                type="text"
                name="marque"
                value={form.marque}
                onChange={handleChange}
                placeholder="HP, Dell, Samsung..."
                required
              />
            </div>
            <div className="form-field">
              <label>Modèle</label>
              <input
                type="text"
                name="modele"
                value={form.modele}
                onChange={handleChange}
                placeholder="Elitebook, Galaxy..."
              />
            </div>
            <div className="form-field">
              <label>Numéro de série</label>
              <input
                type="text"
                name="numero_serie"
                value={form.numero_serie}
                onChange={handleChange}
              />
            </div>
            <div className="form-field full-width">
              <label>Description de la panne *</label>
              <textarea
                name="description_panne"
                value={form.description_panne}
                onChange={handleChange}
                rows={4}
                placeholder="Décrivez le problème rencontré..."
                required
              />
            </div>
            <div className="form-field full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="urgence_entreprise"
                  checked={form.urgence_entreprise}
                  onChange={handleCheckbox}
                />
                <span>Urgence Entreprise (intervention sur site avec géolocalisation)</span>
              </label>
            </div>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}
        {result && (
          <div className="success-box">
            <h3>✅ Ticket créé avec succès !</h3>
            <p>
              Votre code de suivi : <strong>{result.code_suivi}</strong>
            </p>
            <p className="success-note">
              Conservez précieusement ce code pour suivre l'avancement de votre réparation.
            </p>
          </div>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Création en cours...' : 'Créer le ticket'}
        </button>
      </form>
    </div>
  )
}

function ClientTracking({ savedCode }: { savedCode: string }) {
  const [code, setCode] = useState(savedCode)
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-rechercher si un code est sauvegardé
  useEffect(() => {
    if (savedCode) {
      setCode(savedCode)
      // Auto-lancer la recherche après un court délai
      const timer = setTimeout(() => {
        handleSearch(savedCode)
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCode])

  const handleSearch = async (codeToSearch?: string) => {
    const codeToUse = codeToSearch || code
    if (!codeToUse.trim()) {
      setError('Veuillez entrer un code de suivi')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${codeToUse}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Ticket introuvable')
      }

      setTicket(data)
      // Sauvegarder le code dans localStorage
      localStorage.setItem('client_tracking_code', codeToUse)
      setCode(codeToUse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche')
      setTicket(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: TicketStatus) => {
    const statusMap = {
      recu: { label: 'Machine reçue', color: '#3b82f6', step: 1 },
      diagnostic: { label: 'Diagnostic en cours', color: '#f59e0b', step: 2 },
      attente_piece: { label: 'En attente de pièce', color: '#f97316', step: 3 },
      en_reparation: { label: 'En réparation', color: '#8b5cf6', step: 4 },
      termine: { label: 'Terminé / Prêt à récupérer', color: '#10b981', step: 5 },
    }
    return statusMap[status] || statusMap.recu
  }

  return (
    <div className="tracking-container">
      <h2>Suivre ma Réparation</h2>
      <div className="tracking-search">
        <input
          type="text"
          placeholder="Entrez votre code de suivi (ex: TICKET-ABC123)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="tracking-input"
        />
        <button onClick={() => handleSearch()} className="btn-search" disabled={loading}>
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {ticket && (
        <div className="tracking-result">
          <div className="ticket-info-card">
            <h3>Informations du Ticket</h3>
            <div className="info-grid">
              <div>
                <strong>Code de suivi:</strong> {ticket.code_suivi}
              </div>
              <div>
                <strong>Appareil:</strong> {ticket.type_appareil} - {ticket.marque}{' '}
                {ticket.modele || ''}
              </div>
              <div>
                <strong>Description:</strong> {ticket.description_panne}
              </div>
            </div>
          </div>

          <div className="status-card">
            <h3>État de la Réparation</h3>
            <div className="status-progress">
              {(['recu', 'diagnostic', 'attente_piece', 'en_reparation', 'termine'] as TicketStatus[]).map(
                (status) => {
                  const info = getStatusInfo(status)
                  const isActive = info.step <= getStatusInfo(ticket.statut_actuel as TicketStatus).step
                  return (
                    <div
                      key={status}
                      className={`status-step ${isActive ? 'active' : ''}`}
                      style={{ borderColor: isActive ? info.color : '#e2e8f0' }}
                    >
                      <div
                        className="status-dot"
                        style={{
                          backgroundColor: isActive ? info.color : '#e2e8f0',
                        }}
                      />
                      <span>{info.label}</span>
                    </div>
                  )
                },
              )}
            </div>
          </div>

          {(ticket.prix_materiel > 0 || ticket.prix_main_oeuvre > 0) && (
            <>
              <div className="pricing-card">
                <h3>Devis</h3>
                <div className="pricing-details">
                  <div className="price-row">
                    <span>Coût matériel:</span>
                    <strong>{ticket.prix_materiel.toLocaleString()} FCFA</strong>
                  </div>
                  <div className="price-row">
                    <span>Main d'œuvre:</span>
                    <strong>{ticket.prix_main_oeuvre.toLocaleString()} FCFA</strong>
                  </div>
                  <div className="price-row total">
                    <span>Total:</span>
                    <strong>{ticket.prix_total.toLocaleString()} FCFA</strong>
                  </div>
                </div>
              </div>

              <div className="payment-card">
                <h3>💳 Paiement</h3>
                <p className="payment-instruction">
                  Réglez votre réparation en utilisant l'un des moyens ci-dessous :
                </p>
                
                <div className="payment-methods">
                  <div className="payment-method">
                    <div className="payment-method-header">
                      <span className="payment-icon">📱</span>
                      <h4>Mobile Money</h4>
                    </div>
                    <div className="payment-details">
                      <div className="payment-number">
                        <span className="payment-label">Numéro de service :</span>
                        <span className="payment-value">+221 77 123 45 67</span>
                        <button
                          className="btn-copy"
                          onClick={() => {
                            navigator.clipboard.writeText('+221 77 123 45 67')
                            alert('Numéro copié !')
                          }}
                        >
                          📋 Copier
                        </button>
                      </div>
                      <p className="payment-note">
                        Envoyez <strong>{ticket.prix_total.toLocaleString()} FCFA</strong> avec le code de référence : <strong>{ticket.code_suivi}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="payment-method">
                    <div className="payment-method-header">
                      <span className="payment-icon">📲</span>
                      <h4>QR Code</h4>
                    </div>
                    <div className="qr-code-container">
                      <div className="qr-code-placeholder">
                        <div className="qr-code-grid">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div
                              key={i}
                              className="qr-square"
                              style={{
                                backgroundColor: Math.random() > 0.5 ? '#000' : '#fff',
                              }}
                            />
                          ))}
                        </div>
                        <p className="qr-code-text">Scannez avec votre application mobile</p>
                        <p className="qr-code-amount">{ticket.prix_total.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="payment-warning">
                  <span className="warning-icon">⚠️</span>
                  <p>
                    <strong>Important :</strong> N'oubliez pas d'inclure votre code de référence <strong>{ticket.code_suivi}</strong> lors du paiement pour une identification rapide.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

