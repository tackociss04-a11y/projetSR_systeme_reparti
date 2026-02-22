-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    adresse TEXT,
    email VARCHAR(150),
    telephone VARCHAR(30) NOT NULL
);

-- Table des tickets (réparations)
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    code_suivi VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    type_appareil VARCHAR(20) NOT NULL, -- 'telephone' ou 'ordinateur'
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100),
    numero_serie VARCHAR(100),
    description_panne TEXT NOT NULL,

    urgence_entreprise BOOLEAN DEFAULT FALSE,
    gps_latitude DOUBLE PRECISION,
    gps_longitude DOUBLE PRECISION,

    statut_actuel VARCHAR(50) NOT NULL DEFAULT 'recu',
    prix_materiel NUMERIC(10,2),
    prix_main_oeuvre NUMERIC(10,2),
    prix_total NUMERIC(10,2),

    date_creation TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    date_mise_a_jour TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    date_fin_garantie TIMESTAMP WITHOUT TIME ZONE
);

-- Historique des statuts (tracking détaillé)
CREATE TABLE IF NOT EXISTS tickets_statuts (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    statut VARCHAR(50) NOT NULL,
    commentaire TEXT,
    date_changement TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Photos avant / après
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    type_photo VARCHAR(20) NOT NULL, -- 'avant' ou 'apres'
    chemin_fichier TEXT NOT NULL,
    date_ajout TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Pièces utilisées sur un ticket
CREATE TABLE IF NOT EXISTS tickets_pieces (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    libelle_piece VARCHAR(200) NOT NULL,      -- ex: 'Disque SSD 250Go'
    cout_materiel NUMERIC(10,2) NOT NULL      -- prix de cette pièce
);

-- Utilisateurs réparateurs / admin
CREATE TABLE IF NOT EXISTS utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'reparateur' -- ex: 'admin', 'reparateur'
);
