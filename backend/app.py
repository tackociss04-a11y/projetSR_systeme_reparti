from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import random
import string
from datetime import datetime, timedelta

from extensions import db


def generate_ticket_code() -> str:
    """Génère un code de suivi du type TICKET-XYZ123."""
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"TICKET-{suffix}"


def create_app():
    app = Flask(__name__)

    # Autoriser le frontend (Vite) à appeler l'API (CORS)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Configuration de la base PostgreSQL
    db_user = os.getenv("DB_USER", "tacko")
    db_password = os.getenv("DB_PASSWORD", "mot_de_passe_solide")
    db_host = os.getenv("DB_HOST", "localhost")
    db_name = os.getenv("DB_NAME", "projet_sr")

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}/{db_name}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # Import des modèles après l'initialisation de db
    from models import Client, Ticket, TicketPiece

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok"}), 200

    @app.route("/api/tickets", methods=["POST"])
    def create_ticket():
        """
        Crée une nouvelle demande de réparation côté client.
        Données attendues en JSON :
        {
          "nom": "...",
          "prenom": "...",
          "adresse": "...",
          "email": "...",
          "telephone": "...",
          "type_appareil": "telephone" ou "ordinateur",
          "marque": "...",
          "modele": "...",
          "numero_serie": "...",
          "description_panne": "...",
          "urgence_entreprise": true/false
        }
        """
        data = request.get_json() or {}

        required_fields = [
            "nom",
            "prenom",
            "telephone",
            "type_appareil",
            "marque",
            "description_panne",
        ]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return (
                jsonify(
                    {
                        "message": "Champs obligatoires manquants",
                        "champs": missing,
                    }
                ),
                400,
            )

        # Créer ou réutiliser un client avec même téléphone / email
        client = (
            Client.query.filter_by(telephone=data["telephone"])
            .order_by(Client.id.desc())
            .first()
        )
        if client is None:
            client = Client(
                nom=data["nom"],
                prenom=data["prenom"],
                adresse=data.get("adresse"),
                email=data.get("email"),
                telephone=data["telephone"],
            )
            db.session.add(client)
            db.session.flush()  # assigne un id sans commit complet

        code = generate_ticket_code()

        ticket = Ticket(
            code_suivi=code,
            client_id=client.id,
            type_appareil=data["type_appareil"],
            marque=data["marque"],
            modele=data.get("modele"),
            numero_serie=data.get("numero_serie"),
            description_panne=data["description_panne"],
            urgence_entreprise=bool(data.get("urgence_entreprise", False)),
        )
        db.session.add(ticket)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Ticket créé avec succès",
                    "code_suivi": ticket.code_suivi,
                }
            ),
            201,
        )

    @app.route("/api/tickets/<code_suivi>", methods=["GET"])
    def get_ticket_by_code(code_suivi: str):
        """
        Permet au client de suivre sa réparation avec le code_suivi.
        Retourne les infos principales et le statut actuel.
        """
        ticket = Ticket.query.filter_by(code_suivi=code_suivi).first()
        if ticket is None:
            return jsonify({"message": "Ticket introuvable"}), 404

        client = ticket.client

        return jsonify(
            {
                "code_suivi": ticket.code_suivi,
                "statut_actuel": ticket.statut_actuel,
                "type_appareil": ticket.type_appareil,
                "marque": ticket.marque,
                "modele": ticket.modele,
                "description_panne": ticket.description_panne,
                "prix_materiel": float(ticket.prix_materiel or 0),
                "prix_main_oeuvre": float(ticket.prix_main_oeuvre or 0),
                "prix_total": float(ticket.prix_total or 0),
                "client": {
                    "nom": client.nom,
                    "prenom": client.prenom,
                    "telephone": client.telephone,
                },
            }
        )

    @app.route("/api/client/tickets", methods=["GET"])
    def get_client_tickets():
        """
        Récupère tous les tickets d'un client par email ou téléphone.
        Query params: email ou telephone
        """
        email = request.args.get("email")
        telephone = request.args.get("telephone")

        if not email and not telephone:
            return jsonify({"message": "email ou telephone requis"}), 400

        # Chercher le client
        client = None
        if email:
            client = Client.query.filter_by(email=email).order_by(Client.id.desc()).first()
        if not client and telephone:
            client = Client.query.filter_by(telephone=telephone).order_by(Client.id.desc()).first()

        if not client:
            return jsonify({"tickets": [], "client": None}), 200

        # Récupérer tous les tickets du client
        tickets = Ticket.query.filter_by(client_id=client.id).order_by(Ticket.date_creation.desc()).all()

        return jsonify(
            {
                "client": {
                    "id": client.id,
                    "nom": client.nom,
                    "prenom": client.prenom,
                    "email": client.email,
                    "telephone": client.telephone,
                    "adresse": client.adresse,
                },
                "tickets": [
                    {
                        "code_suivi": t.code_suivi,
                        "statut_actuel": t.statut_actuel,
                        "type_appareil": t.type_appareil,
                        "marque": t.marque,
                        "modele": t.modele,
                        "description_panne": t.description_panne,
                        "prix_materiel": float(t.prix_materiel or 0),
                        "prix_main_oeuvre": float(t.prix_main_oeuvre or 0),
                        "prix_total": float(t.prix_total or 0),
                        "date_creation": t.date_creation.isoformat() if t.date_creation else None,
                    }
                    for t in tickets
                ],
            }
        )

    # --- PARTIE REPARATEUR / ADMIN ---

    @app.route("/api/admin/tickets", methods=["GET"])
    def list_tickets():
        """Liste des tickets pour le tableau de bord (option: filtre par statut)."""
        statut = request.args.get("statut")
        query = Ticket.query
        if statut:
            query = query.filter_by(statut_actuel=statut)

        tickets = query.order_by(Ticket.date_creation.desc()).all()

        return jsonify(
            [
                {
                    "code_suivi": t.code_suivi,
                    "statut_actuel": t.statut_actuel,
                    "type_appareil": t.type_appareil,
                    "marque": t.marque,
                    "modele": t.modele,
                    "client_nom": t.client.nom,
                    "client_prenom": t.client.prenom,
                }
                for t in tickets
            ]
        )

    @app.route("/api/admin/tickets/<code_suivi>/status", methods=["PATCH"])
    def update_ticket_status(code_suivi: str):
        """
        Met à jour le statut d'un ticket côté réparateur.
        Corps JSON attendu : { "statut": "diagnostic", ... }
        Exemples de statuts : "recu", "diagnostic", "attente_piece", "en_reparation", "termine"
        """
        data = request.get_json() or {}
        new_status = data.get("statut")
        if not new_status:
            return jsonify({"message": "Nouveau statut manquant"}), 400

        ticket = Ticket.query.filter_by(code_suivi=code_suivi).first()
        if ticket is None:
            return jsonify({"message": "Ticket introuvable"}), 404

        ticket.statut_actuel = new_status

        # Si terminé, définir une date de fin de garantie (ex: +7 jours)
        if new_status == "termine":
            ticket.date_fin_garantie = datetime.utcnow() + timedelta(days=7)

        db.session.commit()

        return jsonify(
            {
                "message": "Statut mis à jour",
                "code_suivi": ticket.code_suivi,
                "statut_actuel": ticket.statut_actuel,
                "date_fin_garantie": ticket.date_fin_garantie.isoformat()
                if ticket.date_fin_garantie
                else None,
            }
        )

    @app.route("/api/admin/tickets/<code_suivi>/devis", methods=["PATCH"])
    def update_ticket_pricing(code_suivi: str):
        """
        Met à jour le devis : coût matériel et main d'œuvre.
        Corps JSON attendu :
        {
          "prix_materiel": 15000,
          "prix_main_oeuvre": 10000
        }
        """
        data = request.get_json() or {}
        ticket = Ticket.query.filter_by(code_suivi=code_suivi).first()
        if ticket is None:
            return jsonify({"message": "Ticket introuvable"}), 404

        prix_materiel = data.get("prix_materiel")
        prix_main_oeuvre = data.get("prix_main_oeuvre")

        if prix_materiel is not None:
            ticket.prix_materiel = prix_materiel
        if prix_main_oeuvre is not None:
            ticket.prix_main_oeuvre = prix_main_oeuvre

        if ticket.prix_materiel is not None or ticket.prix_main_oeuvre is not None:
            ticket.prix_total = (ticket.prix_materiel or 0) + (
                ticket.prix_main_oeuvre or 0
            )

        db.session.commit()

        return jsonify(
            {
                "message": "Devis mis à jour",
                "code_suivi": ticket.code_suivi,
                "prix_materiel": float(ticket.prix_materiel or 0),
                "prix_main_oeuvre": float(ticket.prix_main_oeuvre or 0),
                "prix_total": float(ticket.prix_total or 0),
            }
        )

    @app.route("/api/admin/tickets/<code_suivi>/pieces", methods=["POST"])
    def add_ticket_piece(code_suivi: str):
        """
        Ajoute une pièce utilisée pour la réparation.
        Corps JSON attendu :
        {
          "libelle_piece": "Disque SSD 250Go",
          "cout_materiel": 25000
        }
        """
        data = request.get_json() or {}
        libelle = data.get("libelle_piece")
        cout = data.get("cout_materiel")

        if not libelle or cout is None:
            return jsonify({"message": "libelle_piece et cout_materiel sont requis"}), 400

        ticket = Ticket.query.filter_by(code_suivi=code_suivi).first()
        if ticket is None:
            return jsonify({"message": "Ticket introuvable"}), 404

        piece = TicketPiece(
            ticket_id=ticket.id,
            libelle_piece=libelle,
            cout_materiel=cout,
        )
        db.session.add(piece)

        # Mettre à jour le coût matériel total du ticket
        ticket.prix_materiel = (ticket.prix_materiel or 0) + cout
        if ticket.prix_main_oeuvre is not None:
            ticket.prix_total = (ticket.prix_materiel or 0) + (
                ticket.prix_main_oeuvre or 0
            )

        db.session.commit()

        return jsonify(
            {
                "message": "Pièce ajoutée",
                "code_suivi": ticket.code_suivi,
                "prix_materiel": float(ticket.prix_materiel or 0),
            }
        )

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=5000, debug=True)


