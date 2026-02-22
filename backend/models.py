from datetime import datetime

from extensions import db


class Client(db.Model):
    __tablename__ = "clients"

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    adresse = db.Column(db.Text)
    email = db.Column(db.String(150))
    telephone = db.Column(db.String(30), nullable=False)

    tickets = db.relationship("Ticket", back_populates="client")


class Ticket(db.Model):
    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)
    code_suivi = db.Column(db.String(50), unique=True, nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id"), nullable=False)

    type_appareil = db.Column(db.String(20), nullable=False)  # telephone / ordinateur
    marque = db.Column(db.String(100), nullable=False)
    modele = db.Column(db.String(100))
    numero_serie = db.Column(db.String(100))
    description_panne = db.Column(db.Text, nullable=False)

    urgence_entreprise = db.Column(db.Boolean, default=False)
    gps_latitude = db.Column(db.Float)
    gps_longitude = db.Column(db.Float)

    statut_actuel = db.Column(db.String(50), nullable=False, default="recu")
    prix_materiel = db.Column(db.Numeric(10, 2))
    prix_main_oeuvre = db.Column(db.Numeric(10, 2))
    prix_total = db.Column(db.Numeric(10, 2))

    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_mise_a_jour = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    date_fin_garantie = db.Column(db.DateTime)

    client = db.relationship("Client", back_populates="tickets")
    pieces = db.relationship("TicketPiece", back_populates="ticket")


class TicketPiece(db.Model):
    __tablename__ = "tickets_pieces"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False)
    libelle_piece = db.Column(db.String(200), nullable=False)
    cout_materiel = db.Column(db.Numeric(10, 2), nullable=False)

    ticket = db.relationship("Ticket", back_populates="pieces")


