# SpeedMind
SpeedMind est un jeu de quiz multijoueur développé avec React, Node.js, MongoDB et Socket.IO.
Deux joueurs s’affrontent en temps réel pour répondre le plus rapidement possible à des questions Vrai ou Faux.

Fonctionnalités

- Connexion en temps réel grâce à WebSockets (Socket.IO)
- Deux joueurs peuvent se connecter et jouer simultanément
- Les questions sont tirées aléatoirement depuis MongoDB
- Le joueur le plus rapide gagne le point
- Timer global de 30 secondes pour la partie
- Affichage du score et du gagnant à la fin de la partie

Technologies utilisées:
- Côté serveur (Backend)
    Node.js
    Express.js
    Socket.IO
    MongoDB (via Mongoose)

- Côté client (Frontend)
    React.js
    Socket.IO Client
    CSS3

Structure du projet
  SpeedMind/
   ┣ server/
   ┃ ┣ models/
   ┃ ┃ ┗ question.js
   ┃ ┣ routes/
   ┃ ┃ ┗ index.js
   ┃ ┗ app.js
   ┣ client/
   ┃ ┗ src/
   ┃ ┃ ┗ App.js
   ┣ package.json
   ┗ README.md

Exemple de flux de jeu

  Deux joueurs se connectent → le jeu démarre automatiquement.
  Le serveur envoie une question aléatoire depuis MongoDB.
  Les joueurs répondent → le serveur calcule le plus rapide et attribue un point.
  Après 30 secondes → le serveur envoie le résumé final avec le gagnant.

Auteur

Gween Hans-Berryl Kangah
Étudiante en Génie Informatique – Collège La Cité
Projet : Programmation distribuée — Jeu de Quiz WebSocket
