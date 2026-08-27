const { getAIResponse } = require("../services/aiService");
const User = require("../models/User");

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ message: "Le message ne peut pas être vide." });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: "Message trop long (max 1000 caractères)." });
    }

    // Contexte de l'étudiant connecté (optionnel, pour personnaliser la réponse)
    let studentContext = null;
    if (req.user) {
      const user = await User.findById(req.user.id).select("firstName lastName level role");
      if (user) {
        studentContext = user;
      }
    }

    const reply = await getAIResponse(message.trim(), studentContext);

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Erreur chatController:", err);
    res.status(500).json({ message: "Erreur lors du traitement du message.", error: err.message });
  }
};