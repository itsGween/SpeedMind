const mongoose = require("mongoose");

// Schema d'une question
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  correctAnswer: { type: Boolean, required: true },
});

//Export du modele pour l'utiliser ailleurs dans le code
module.exports = mongoose.model("Question", questionSchema);
