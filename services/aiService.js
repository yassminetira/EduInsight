const axios = require("axios");

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de la plateforme EduInsight.
Tu aides les étudiants avec leurs questions sur les cours, quiz, et navigation dans la plateforme.
Réponds toujours en français, de manière claire et concise.`;

exports.getAIResponse = async (userMessage, studentContext) => {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return getFallbackResponse(userMessage);
  }

  try {
    const contextInfo = studentContext
      ? `Contexte étudiant: ${studentContext.firstName} ${studentContext.lastName}, niveau ${studentContext.level || "N/A"}.`
      : "";

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n${contextInfo}` },
          { role: "user", content: userMessage },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("Erreur AI service:", err.message);
    return getFallbackResponse(userMessage);
  }
};

// Réponse de secours si l'API AI échoue ou n'est pas configurée
function getFallbackResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes("cours")) {
    return "Vous pouvez consulter vos cours dans la section 'My Courses' du menu.";
  }
  if (msg.includes("quiz")) {
    return "Vos quiz sont disponibles dans la section 'My Quizzes'.";
  }
  return "Je suis actuellement en mode limité. Veuillez consulter le menu principal ou contacter votre enseignant pour plus d'informations.";;
}