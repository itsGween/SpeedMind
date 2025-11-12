const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const Question = require("./models/question");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

// Connexion MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/quizdb")
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur Mongo:", err));

const io = socketIo(server, {
  //serveur WebSocket à partir du serveur HTTP
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

// --- Variables globales ---
let players = [];
let askedQuestions = []; // stocke les ID des questions déjà posés
let currentQuestion = null;
let gameTimer = null;
const gameDuration = 30000; // 30 secondes

io.on("connection", (socket) => {
  console.log("Nouveau client connecté:", socket.id);

  // --- Inscription joueur ---
  socket.on("registerPlayer", (username) => {
    players.push({
      id: socket.id,
      username,
      answer: null,
      time: null,
      score: 0,
    });
    console.log("Joueur enregistré:", username);

    if (players.length < 2) {
      io.to(socket.id).emit("waiting", "En attente d’un autre joueur...");
    } else {
      io.emit("ready", "Deux joueurs connectés, le jeu commence !");

      // Démarrer timer global
      if (!gameTimer) {
        gameTimer = setTimeout(() => {
          endGame();
        }, gameDuration);

        // Informer les joueurs du temps restant
        io.emit("gameStarted", { duration: gameDuration });
      }

      sendNewQuestion();
    }
  });

  // --- Réponse joueur ---
  socket.on("sendAnswer", ({ username, answer }) => {
    const player = players.find((p) => p.username === username);
    if (player && player.answer === null) {
      player.answer = answer;
      player.time = Date.now();

      if (players.every((p) => p.answer !== null)) {
        evaluateAnswers();
      }
    }
  });

  // --- Déconnexion ---
  socket.on("disconnect", () => {
    console.log("Client déconnecté:", socket.id);
    players = players.filter((p) => p.id !== socket.id);
  });
});

// --- Envoyer une question ---
async function sendNewQuestion() {
  if (!gameTimer) return; // Si partie terminée
  try {
    const question = await Question.aggregate([
      { $match: { _id: { $nin: askedQuestions } } }, // exclure les déjà posées
      { $sample: { size: 1 } }, // en tirer une au hasard
    ]);
    if (question.length > 0) {
      currentQuestion = question[0];

      // Ajouter l'ID à la liste des questions posées
      askedQuestions.push(currentQuestion._id);
      // Réinitialiser les réponses
      players = players.map((p) => ({ ...p, answer: null, time: null }));

      io.emit("newQuestion", {
        text: currentQuestion.text,
      });

      console.log("Question envoyée:", currentQuestion.text);
    }
  } catch (err) {
    console.error("Erreur MongoDB:", err);
  }
}

// --- Évaluer les réponses ---
function evaluateAnswers() {
  if (!currentQuestion) return;

  const correctPlayers = players.filter(
    (p) => p.answer === currentQuestion.correctAnswer
  );

  let winner = null;
  if (correctPlayers.length > 0) {
    winner = correctPlayers.reduce((prev, curr) =>
      prev.time < curr.time ? prev : curr
    );
    winner.score++;
  }

  io.emit("result", {
    correctAnswer: currentQuestion.correctAnswer,
    roundWinner: winner ? winner.username : "Aucun",
    scores: players.map((p) => ({ username: p.username, score: p.score })),
  });

  // Nouvelle question après 2s
  setTimeout(sendNewQuestion, 2000);
}

// --- Fin du jeu ---
function endGame() {
  clearTimeout(gameTimer);
  gameTimer = null;
  askedQuestions = []; // vide la liste des questions deja posees pour la prochaine partie

  const topScore = Math.max(...players.map((p) => p.score));
  const winners = players.filter((p) => p.score === topScore);

  io.emit("gameOver", {
    winners: winners.map((w) => w.username),
    topScore,
    scores: players.map((p) => ({ username: p.username, score: p.score })),
  });

  console.log("Partie terminée !");
}

server.listen(port, () => console.log(`Listening on port ${port}`));
