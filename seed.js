// seed.js
// ✅ Version complète : 10 de chaque entité + 2 admins
// + Inscription, QuizAttempt, Answer, Notification, Recommendation, PerformanceMetric, AuditLog
// Ordre : Departement -> Users -> Cours -> Module -> Lesson -> Quiz -> Question -> Choice
//         -> Inscription -> QuizAttempt -> Answer -> Notification -> Recommendation -> PerformanceMetric -> AuditLog

const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");

// Modèles de base
const User = require("./models/User");
const Cours = require("./models/Cours");
const Module = require("./models/Module");
const Lesson = require("./models/Lesson");
const Quiz = require("./models/Quiz");
const Question = require("./models/Question");
const Choice = require("./models/Choice");
const Departement = require("./models/Departement");

// Discriminators
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Admin = require("./models/Admin");

// Nouveaux modèles
const Inscription = require("./models/Inscription");
const QuizAttempt = require("./models/QuizAttempt");
const Answer = require("./models/Answer");
const Notification = require("./models/Notification");
const Recommendation = require("./models/Recommendation");
const PerformanceMetric = require("./models/PerformanceMetric");
const AuditLog = require("./models/AuditLog");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/insight";

const NB = 10; // nombre d'éléments à créer par entité
const NB_ADMINS = 2;
const LEVELS = ["L1", "L2", "L3", "M1", "M2"];

const seedDatabase = async () => {
  try {
    // 1. Connexion
    await mongoose.connect(MONGO_URI);
    console.log("🔌 Connecté à MongoDB pour le seeding...");

    // 2. Nettoyage
    await Departement.deleteMany({});
    await User.deleteMany({});
    await Cours.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await Choice.deleteMany({});
    await Inscription.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Answer.deleteMany({});
    await Notification.deleteMany({});
    await Recommendation.deleteMany({});
    await PerformanceMetric.deleteMany({});
    await AuditLog.deleteMany({});
    console.log("🧹 Anciennes données supprimées.");

    // 3. Hash du mot de passe par défaut
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    // 4. Departements (10)
    const departements = [];
    for (let i = 1; i <= NB; i++) {
      departements.push(
        await Departement.create({
          name: `Département ${i}`,
          description: `Description du département ${i}`,
          createdAt: new Date(),
        })
      );
    }
    console.log(`✅ ${NB} Departements créés.`);

    // 5. Admins (2)
    const admins = [];
    for (let i = 1; i <= NB_ADMINS; i++) {
      admins.push(
        await Admin.create({
          firstName: `Admin${i}`,
          lastName: "System",
          email: `admin${i}@insight.com`,
          password: hashedPassword,
          permissions: ["ALL_PERMISSIONS"],
        })
      );
    }
    console.log(`✅ ${NB_ADMINS} Admins créés.`);

    // 6. Teachers (10)
    const teachers = [];
    for (let i = 1; i <= NB; i++) {
      teachers.push(
        await Teacher.create({
          firstName: `Teacher${i}`,
          lastName: "Dev",
          email: `teacher${i}@insight.com`,
          password: hashedPassword,
          speciality: "MERN Stack & Web Dev",
          office: `B-${200 + i}`,
          department: departements[i % departements.length]._id,
        })
      );
    }
    console.log(`✅ ${NB} Teachers créés.`);

    // 7. Students (10)
    const students = [];
    for (let i = 1; i <= NB; i++) {
      students.push(
        await Student.create({
          firstName: `Student${i}`,
          lastName: "Ben",
          email: `student${i}@insight.com`,
          password: hashedPassword,
          studentCode: `ETU${String(i).padStart(4, "0")}`,
          level: LEVELS[i % LEVELS.length],
          group: `G${(i % 3) + 1}`,
          department: departements[i % departements.length]._id,
        })
      );
    }
    console.log(`✅ ${NB} Students créés.`);

    // 8. Cours (10)
    const coursList = [];
    for (let i = 1; i <= NB; i++) {
      coursList.push(
        await Cours.create({
          Title: `Cours ${i} : Développement Web`,
          Description: `Description du cours ${i}`,
          Department: departements[i % departements.length]._id,
          Teacher: teachers[i % teachers.length]._id,
          Duration: "30h",
          Level: "Intermédiaire",
        })
      );
    }
    console.log(`✅ ${NB} Cours créés.`);

    // 9. Modules (10)
    const modules = [];
    for (let i = 1; i <= NB; i++) {
      modules.push(
        await Module.create({
          title: `Module ${i}`,
          description: `Description du module ${i}`,
          order: i,
          cours: coursList[i % coursList.length]._id,
          createdAt: new Date(),
        })
      );
    }
    console.log(`✅ ${NB} Modules créés.`);

    // 10. Lessons (10)
    for (let i = 1; i <= NB; i++) {
      await Lesson.create({
        title: `Leçon ${i}`,
        content: `<h1>Leçon ${i}</h1><p>Contenu de la leçon ${i}...</p>`,
        order: String(i),
        module: modules[i % modules.length]._id,
        createdAt: new Date(),
      });
    }
    console.log(`✅ ${NB} Lessons créées.`);

    // 11. Quizzes (10)
    const quizzes = [];
    for (let i = 1; i <= NB; i++) {
      quizzes.push(
        await Quiz.create({
          cours: coursList[i % coursList.length]._id,
          title: `Quiz ${i}`,
          description: `Test sur le module ${i}`,
          duration: 15,
          passingScore: 60,
          isPublished: true,
          createdBy: teachers[i % teachers.length]._id,
        })
      );
    }
    console.log(`✅ ${NB} Quizzes créés.`);

    // 12. Questions (10) + Choices (3 par question) — on garde une référence à la bonne réponse
    const questions = [];
    const correctChoiceByQuestion = [];
    for (let i = 1; i <= NB; i++) {
      const question = await Question.create({
        Quiz: quizzes[i % quizzes.length]._id,
        statement: `Question ${i} : Quel middleware permet de parser le JSON dans Express ?`,
        status: "MCQ",
        point: 2,
        order: i,
      });
      questions.push(question);

      const choices = await Choice.create([
        { question: question._id, text: "express.json()", isCorrect: true, order: 1 },
        { question: question._id, text: "express.parse()", isCorrect: false, order: 2 },
        { question: question._id, text: "body.json()", isCorrect: false, order: 3 },
      ]);
      correctChoiceByQuestion.push(choices.find((c) => c.isCorrect));
    }
    console.log(`✅ ${NB} Questions (+ Choices) créées.`);

    // 13. Inscriptions (10) — chaque student inscrit à un cours
    for (let i = 0; i < NB; i++) {
      await Inscription.create({
        student: students[i]._id,
        cours: coursList[i % coursList.length]._id,
        enrolledAt: new Date(),
        status: "active",
      });
    }
    console.log(`✅ ${NB} Inscriptions créées.`);

    // 14. QuizAttempts (10) — chaque student tente un quiz
    const attempts = [];
    for (let i = 0; i < NB; i++) {
      const attempt = await QuizAttempt.create({
        student: students[i]._id,
        Quiz: quizzes[i % quizzes.length]._id,
        score: 80,
        totalQuestions: 1,
        staredAt: new Date(),
        submitteAt: new Date(),
      });
      attempts.push(attempt);
    }
    console.log(`✅ ${NB} QuizAttempts créés.`);

    // 15. Answers (10) — une réponse (correcte) par attempt, liée à la question du quiz correspondant
    for (let i = 0; i < NB; i++) {
      await Answer.create({
        attempt: attempts[i]._id,
        question: questions[i]._id,
        selectedChoice: correctChoiceByQuestion[i]._id,
        isCorrect: true,
        pointsEarned: questions[i].point,
      });
    }
    console.log(`✅ ${NB} Answers créées.`);

    // 16. Notifications (10) — pour les students
    for (let i = 0; i < NB; i++) {
      await Notification.create({
        user: students[i]._id,
        title: `Notification ${i + 1}`,
        message: `Vous avez une nouvelle activité sur le cours ${i + 1}.`,
        type: "info",
        isRead: false,
        createdAt: new Date(),
      });
    }
    console.log(`✅ ${NB} Notifications créées.`);

    // 17. Recommendations (10) — pour les students
    for (let i = 0; i < NB; i++) {
      await Recommendation.create({
        student: students[i]._id,
        message: `Nous vous recommandons de revoir le module ${i + 1}.`,
        type: "revision",
        confidenceScore: 0.75,
        createdAt: new Date(),
      });
    }
    console.log(`✅ ${NB} Recommendations créées.`);

    // 18. PerformanceMetrics (10) — pour les students
    for (let i = 0; i < NB; i++) {
      await PerformanceMetric.create({
        student: students[i]._id,
        Cours: coursList[i % coursList.length]._id,
        weekname: `Semaine ${i + 1}`,
        quizScorreAverage: 75,
        attendanceRate: 90,
        createdAt: new Date(),
      });
    }
    console.log(`✅ ${NB} PerformanceMetrics créées.`);

    // 19. AuditLogs (10) — actions des admins/teachers
    for (let i = 0; i < NB; i++) {
      const actor = i % 2 === 0 ? admins[i % admins.length] : teachers[i % teachers.length];
      await AuditLog.create({
        user: actor._id,
        action: "CREATE",
        entity: "Cours",
        entityId: coursList[i % coursList.length]._id,
        ipAddress: "127.0.0.1",
      });
    }
    console.log(`✅ ${NB} AuditLogs créés.`);

    console.log("🎉 Seeding terminé avec succès !");
    console.log(
      `📊 Résumé : ${NB} Departements, ${NB_ADMINS} Admins, ${NB} Teachers, ${NB} Students, ${NB} Cours, ${NB} Modules, ${NB} Lessons, ${NB} Quizzes, ${NB} Questions, ${NB} Inscriptions, ${NB} QuizAttempts, ${NB} Answers, ${NB} Notifications, ${NB} Recommendations, ${NB} PerformanceMetrics, ${NB} AuditLogs.`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur durant le seeding :", error);
    process.exit(1);
  }
};

seedDatabase();