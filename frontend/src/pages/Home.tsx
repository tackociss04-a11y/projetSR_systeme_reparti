import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-brand">
          <span className="home-brand-mark">T6</span>
          <span className="home-brand-text">All-in-One Services</span>
        </div>
        <nav className="home-nav">
          <Link to="/login" className="btn-secondary">Connexion</Link>
          <Link to="/register" className="btn-primary">Inscription</Link>
        </nav>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Votre partenaire de confiance pour la réparation d'équipements
            </h1>
            <p className="hero-subtitle">
              Réparation professionnelle d'ordinateurs et téléphones avec suivi en temps réel
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn-primary-large">
                Commencer maintenant
              </Link>
              <Link to="/login" className="btn-secondary-large">
                J'ai déjà un compte
              </Link>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Pourquoi choisir T6 All-in-One Services ?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Suivi en temps réel</h3>
                <p>
                  Suivez l'avancement de votre réparation étape par étape avec un code de suivi unique.
                  Plus besoin d'appeler, tout est transparent.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Devis transparent</h3>
                <p>
                  Connaissez le prix exact avant de venir récupérer votre appareil.
                  Coût matériel et main d'œuvre détaillés.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>Garantie incluse</h3>
                <p>
                  Toutes nos réparations bénéficient d'une garantie de 7 jours.
                  Service après-vente réactif et professionnel.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📸</div>
                <h3>Preuve par l'image</h3>
                <p>
                  Photos avant/après pour garantir l'état de votre appareil.
                  Traçabilité complète de chaque intervention.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Service express</h3>
                <p>
                  Option urgence entreprise disponible.
                  Intervention rapide pour minimiser vos temps d'arrêt.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔧</div>
                <h3>Expertise technique</h3>
                <p>
                  Équipe qualifiée pour ordinateurs et téléphones.
                  Historique technique complet de chaque réparation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="process-section">
          <div className="container">
            <h2 className="section-title">Comment ça marche ?</h2>
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <h3>Créez votre demande</h3>
                <p>
                  Remplissez le formulaire en ligne avec les informations de votre appareil
                  et la description de la panne.
                </p>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <h3>Recevez votre code</h3>
                <p>
                  Un code de suivi unique vous est attribué (ex: TICKET-ABC123).
                  Conservez-le précieusement.
                </p>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <h3>Suivez en direct</h3>
                <p>
                  Consultez l'avancement de votre réparation : reçu, diagnostic,
                  en attente de pièce, en réparation, terminé.
                </p>
              </div>
              <div className="process-step">
                <div className="step-number">4</div>
                <h3>Récupérez votre appareil</h3>
                <p>
                  Une fois terminé, venez récupérer votre appareil réparé.
                  Le prix vous est communiqué avant votre venue.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <h2 className="cta-title">Prêt à commencer ?</h2>
            <p className="cta-text">
              Rejoignez nos clients satisfaits et bénéficiez d'un service de qualité
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary-large">
                Créer un compte
              </Link>
              <Link to="/login" className="btn-secondary-large">
                Se connecter
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="container">
          <p>&copy; 2026 T6 All-in-One Services. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

