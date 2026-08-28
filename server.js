// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
const app = express();
/* Middlewares globaux */
app.use(cors());         // autoriser les requêtes externes
app.use(express.json()); // lire le body JSON
app.use(express.urlencoded({ extended: true })); // parser application/x-www-form-urlencoded

// Connexion BDD
connectDB();



// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cours", require("./routes/coursRoutes"));
app.use("/api/departements", require("./routes/departementRoutes"));
app.use("/api/answers", require("./routes/answerRoutes"));
app.use("/api/modules", require("./routes/moduleRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/inscriptions", require("./routes/inscriptionRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/quizattempts", require("./routes/quizattemptRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/performancemetrics", require("./routes/performanceMetricRoutes"));
app.use("/api/auditlogs", require("./routes/auditLogRoutes"));
app.use("/api/choices", require("./routes/choiceRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/register", require("./routes/authRoutes"));
app.use("/api/login", require("./routes/authRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
