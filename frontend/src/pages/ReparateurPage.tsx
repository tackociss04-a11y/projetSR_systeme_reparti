import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ReparateurPage.css'

type TicketStatus =
  | 'recu'
  | 'diagnostic'
  | 'attente_piece'
  | 'en_reparation'
  | 'termine'

type TicketSummary = {
  code_suivi: string
  statut_actuel: TicketStatus
  type_appareil: string
  marque: string
  modele: string | null
  client_nom: string
  client_prenom: string
}

const API_BASE_URL = 'http://localhost:5000/api'

export default function ReparateurPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [devisLoading, setDevisLoading] = useState(false)
  const [devisForm, setDevisForm] = useState({
    prix_materiel: '',
    prix_main_oeuvre: '',
  })
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    navigate('/')
  }

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tickets`)
      const data = await response.json()
      setTickets(data)
    } catch (err) {
      console.error('Erreur lors du chargement des tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (code_suivi: string, statut: TicketStatus) => {
    setStatusUpdateLoading(true)
    try {
      await fetch(`${API_BASE_URL}/admin/tickets/${encodeURIComponent(code_suivi)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      })
      await fetchTickets()
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const submitDevis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return
    setDevisLoading(true)
    try {
      await fetch(
        `${API_BASE_URL}/admin/tickets/${encodeURIComponent(selectedTicket)}/devis`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prix_materiel: Number(devisForm.prix_materiel || 0),
            prix_main_oeuvre: Number(devisForm.prix_main_oeuvre || 0),
          }),
        },
      )
      setDevisForm({ prix_materiel: '', prix_main_oeuvre: '' })
      await fetchTickets()
      alert('Devis mis à jour avec succès !')
    } catch (err) {
      console.error('Erreur lors de la mise à jour du devis:', err)
      alert('Erreur lors de la mise à jour du devis')
    } finally {
      setDevisLoading(false)
    }
  }

  const getStatusColor = (status: TicketStatus) => {
    const colors = {
      recu: '#3b82f6',
      diagnostic: '#f59e0b',
      attente_piece: '#f97316',
      en_reparation: '#8b5cf6',
      termine: '#10b981',
    }
    return colors[status] || '#64748b'
  }

  const getStatusLabel = (status: TicketStatus) => {
    const labels = {
      recu: 'Reçu',
      diagnostic: 'Diagnostic',
      attente_piece: 'Attente pièce',
      en_reparation: 'En réparation',
      termine: 'Terminé',
    }
    return labels[status] || status
  }

  return (
    <div className="reparateur-page">
      <header className="reparateur-header">
        <div className="reparateur-brand">
          <span className="reparateur-brand-mark">T6</span>
          <span className="reparateur-brand-text">Dashboard Réparateur</span>
        </div>
        <div className="reparateur-user">
          <span>🔧 {user.prenom} {user.nom}</span>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="reparateur-main">
        <div className="dashboard-header">
          <h1>Gestion des Réparations</h1>
          <button onClick={fetchTickets} className="btn-refresh" disabled={loading}>
            {loading ? 'Actualisation...' : '🔄 Actualiser la liste'}
          </button>
        </div>

        <div className="dashboard-layout">
          <div className="tickets-list">
            <h2>Liste des Tickets ({tickets.length})</h2>
            {tickets.length === 0 && !loading && (
              <div className="empty-state">
                <p>Aucun ticket pour le moment.</p>
                <p>Cliquez sur "Actualiser la liste" pour charger les tickets.</p>
              </div>
            )}
            {tickets.map((ticket) => (
              <div
                key={ticket.code_suivi}
                className={`ticket-card ${
                  selectedTicket === ticket.code_suivi ? 'selected' : ''
                }`}
                onClick={() => setSelectedTicket(ticket.code_suivi)}
              >
                <div className="ticket-card-header">
                  <span className="ticket-code">{ticket.code_suivi}</span>
                  <span
                    className="ticket-status-badge"
                    style={{ backgroundColor: getStatusColor(ticket.statut_actuel) }}
                  >
                    {getStatusLabel(ticket.statut_actuel)}
                  </span>
                </div>
                <div className="ticket-card-body">
                  <p>
                    <strong>Client:</strong> {ticket.client_prenom} {ticket.client_nom}
                  </p>
                  <p>
                    <strong>Appareil:</strong> {ticket.type_appareil} - {ticket.marque}{' '}
                    {ticket.modele || ''}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedTicket && (
            <div className="ticket-actions">
              <h2>Actions pour {selectedTicket}</h2>

              <div className="action-section">
                <h3>Changer le statut</h3>
                <div className="status-buttons">
                  {(['recu', 'diagnostic', 'attente_piece', 'en_reparation', 'termine'] as TicketStatus[]).map(
                    (statut) => (
                      <button
                        key={statut}
                        onClick={() => updateStatus(selectedTicket, statut)}
                        className="btn-status"
                        disabled={statusUpdateLoading}
                        style={{ borderColor: getStatusColor(statut) }}
                      >
                        {getStatusLabel(statut)}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="action-section">
                <h3>Mettre à jour le devis</h3>
                <form onSubmit={submitDevis} className="devis-form">
                  <div className="form-field">
                    <label>Coût matériel (FCFA)</label>
                    <input
                      type="number"
                      value={devisForm.prix_materiel}
                      onChange={(e) =>
                        setDevisForm({ ...devisForm, prix_materiel: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="form-field">
                    <label>Main d'œuvre (FCFA)</label>
                    <input
                      type="number"
                      value={devisForm.prix_main_oeuvre}
                      onChange={(e) =>
                        setDevisForm({ ...devisForm, prix_main_oeuvre: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                  <button type="submit" className="btn-submit" disabled={devisLoading}>
                    {devisLoading ? 'Mise à jour...' : 'Mettre à jour le devis'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {!selectedTicket && (
            <div className="ticket-actions empty">
              <p>Sélectionnez un ticket pour voir les actions disponibles</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

