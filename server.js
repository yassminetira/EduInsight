// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
const app = express();

app.use(cors());
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (req.method === 'OPTIONS') {
    return next();
  }

  if (contentType.includes('application/json') || contentType.includes('application/x-www-form-urlencoded')) {
    return next();
  }

  if (contentType.includes('text/plain')) {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        req.body = {};
        return next();
      }

      try {
        req.body = JSON.parse(raw);
      } catch {
        try {
          const params = new URLSearchParams(raw);
          const parsed = Object.fromEntries(params.entries());

          const onlyEntry = Object.keys(parsed)[0];
          if (Object.keys(parsed).length === 1 && onlyEntry && onlyEntry.startsWith('{')) {
            try {
              req.body = JSON.parse(onlyEntry);
            } catch {
              req.body = parsed;
            }
          } else {
            req.body = parsed;
          }
        } catch {
          req.body = {};
        }
      }
      next();
    });
    return;
  }

  next();
});
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

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
