// seed.js
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

    // 4. Departements (10) — alignés avec les Cours
const departementNames = [
  { name: "Développement Web Frontend", description: "Formation en interfaces web modernes : React, composants et gestion d'état." },
  { name: "Développement Backend & APIs", description: "Conception d'APIs REST robustes avec Node.js et Express." },
  { name: "Bases de Données & NoSQL", description: "Modélisation de données NoSQL et requêtes avec MongoDB/Mongoose." },
  { name: "Design & Expérience Utilisateur", description: "UX/UI design, ergonomie et prototypage d'interfaces." },
  { name: "Data Science & Analyse de Données", description: "Analyse de données avec Python, Pandas, NumPy et Matplotlib." },
  { name: "Intelligence Artificielle & Machine Learning", description: "Algorithmes de ML et frameworks comme scikit-learn." },
  { name: "Cloud Computing & DevOps", description: "Déploiement, CI/CD et architecture cloud (AWS/Azure)." },
  { name: "Cybersécurité", description: "Fondamentaux de la sécurité informatique et bonnes pratiques." },
  { name: "Architecture Logicielle", description: "Design patterns et principes SOLID pour applications scalables." },
  { name: "Développement Mobile", description: "Applications mobiles multiplateformes avec Flutter." },
];

const departements = [];
for (let i = 0; i < NB; i++) {
  departements.push(
    await Departement.create({
      name: departementNames[i].name,
      description: departementNames[i].description,
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
const teacherNames = [
  { firstName: "Alice", lastName: "Professor", speciality: "Développement Web (React/Node.js)" },
  { firstName: "Bob", lastName: "Khaled", speciality: "Data Science & Python" },
  { firstName: "Carol", lastName: "Lopez", speciality: "UX/UI Design" },
  { firstName: "David", lastName: "Martin", speciality: "Machine Learning" },
  { firstName: "Eva", lastName: "Rossi", speciality: "Cloud & DevOps" },
  { firstName: "Frank", lastName: "Trabelsi", speciality: "Cybersécurité" },
  { firstName: "Grace", lastName: "Chen", speciality: "Architecture Logicielle" },
  { firstName: "Hugo", lastName: "Bernard", speciality: "Développement Mobile" },
  { firstName: "Ines", lastName: "Amri", speciality: "Bases de données" },
  { firstName: "Jack", lastName: "Nasri", speciality: "DevOps & CI/CD" },
];

const teachers = [];
for (let i = 0; i < NB; i++) {
  teachers.push(
    await Teacher.create({
      firstName: teacherNames[i].firstName,
      lastName: teacherNames[i].lastName,
      email: `${teacherNames[i].firstName.toLowerCase()}.${teacherNames[i].lastName.toLowerCase()}@insight.com`,
      password: hashedPassword,
      speciality: teacherNames[i].speciality,
      office: `B-${200 + i}`,
      department: departements[i % departements.length]._id,
    })
  );
}
console.log(`✅ ${NB} Teachers créés.`);

    // 7. Students (10)
const studentNames = [
  { firstName: "Emma", lastName: "Wilson" },
  { firstName: "Liam", lastName: "Bouazizi" },
  { firstName: "Sofia", lastName: "Karray" },
  { firstName: "Noah", lastName: "Ferjani" },
  { firstName: "Mia", lastName: "Gharbi" },
  { firstName: "Adam", lastName: "Jlassi" },
  { firstName: "Lina", lastName: "Mansour" },
  { firstName: "Yassine", lastName: "Belhadj" },
  { firstName: "Nour", lastName: "Sassi" },
  { firstName: "Omar", lastName: "Cherif" },
];

const students = [];
for (let i = 0; i < NB; i++) {
  students.push(
    await Student.create({
      firstName: studentNames[i].firstName,
      lastName: studentNames[i].lastName,
      email: `${studentNames[i].firstName.toLowerCase()}.${studentNames[i].lastName.toLowerCase()}@insight.com`,
      password: hashedPassword,
      studentCode: `ETU${String(i + 1).padStart(4, "0")}`,
      level: LEVELS[i % LEVELS.length],
      group: `G${(i % 3) + 1}`,
      department: departements[i]._id,
    })
  );
}
console.log(`✅ ${NB} Students créés.`);

// 8. Cours (10)
const coursData = [
  { Title: "Introduction à React", Description: "Apprenez les bases de React : composants, props, state et hooks.", Level: "Débutant" },
  { Title: "Node.js & Express avancé", Description: "Construisez des APIs REST robustes avec Node.js et Express.", Level: "Avancé" },
  { Title: "Bases de données MongoDB", Description: "Modélisation de données NoSQL et requêtes avec Mongoose.", Level: "Intermédiaire" },
  { Title: "UX/UI Design Fondamentaux", Description: "Principes de design centré utilisateur et prototypage.", Level: "Débutant" },
  { Title: "Python pour la Data Science", Description: "Analyse de données avec Pandas, NumPy et Matplotlib.", Level: "Intermédiaire" },
  { Title: "Machine Learning Appliqué", Description: "Introduction aux algorithmes de ML et à scikit-learn.", Level: "Avancé" },
  { Title: "DevOps & Cloud Computing", Description: "Déploiement, CI/CD et architecture cloud (AWS/Azure).", Level: "Avancé" },
  { Title: "Cybersécurité 101", Description: "Fondamentaux de la sécurité informatique et bonnes pratiques.", Level: "Débutant" },
  { Title: "Architecture Logicielle", Description: "Design patterns et principes SOLID pour applications scalables.", Level: "Intermédiaire" },
  { Title: "Développement Mobile Flutter", Description: "Créez des applications mobiles multiplateformes avec Flutter.", Level: "Intermédiaire" },
];


const teacherAssignment = [0, 1, 2, 0, 1, 3, 4, 0, 5, 6];

const coursList = [];
for (let i = 0; i < NB; i++) {
  coursList.push(
    await Cours.create({
      Title: coursData[i].Title,
      Description: coursData[i].Description,
      Department: departements[i]._id,
      Teacher: teachers[teacherAssignment[i]]._id,
      Duration: `${20 + i * 2}h`,
      Level: coursData[i].Level,
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

    // 11. Quizzes (10) — alignés avec les Cours
const quizData = [
  { title: "Quiz : Les fondamentaux de React", description: "Évaluation sur les composants, props et state." },
  { title: "Quiz : APIs REST avec Express", description: "Évaluation sur les routes, middlewares et contrôleurs." },
  { title: "Quiz : Modélisation MongoDB", description: "Évaluation sur les schémas Mongoose et les requêtes." },
  { title: "Quiz : Principes UX/UI", description: "Évaluation sur l'ergonomie et le prototypage." },
  { title: "Quiz : Analyse de données avec Pandas", description: "Évaluation sur la manipulation de DataFrames." },
  { title: "Quiz : Algorithmes de Machine Learning", description: "Évaluation sur les modèles de classification et régression." },
  { title: "Quiz : Déploiement Cloud & CI/CD", description: "Évaluation sur Docker, pipelines et architecture cloud." },
  { title: "Quiz : Sécurité informatique", description: "Évaluation sur les failles XSS, CSRF et injections SQL." },
  { title: "Quiz : Design Patterns", description: "Évaluation sur Singleton, Factory et principes SOLID." },
  { title: "Quiz : Développement mobile Flutter", description: "Évaluation sur les widgets et la navigation Flutter." },
];

const quizzes = [];
for (let i = 0; i < NB; i++) {
  quizzes.push(
    await Quiz.create({
      cours: coursList[i]._id,
      title: quizData[i].title,
      description: quizData[i].description,
      duration: 15,
      passingScore: 60,
      isPublished: true,
      createdBy: teachers[i]._id,
    })
  );
}
console.log(`✅ ${NB} Quizzes créés.`);

   // 12. Questions (10) + Choices (3 par question) — alignées avec les Quizzes
const questionData = [
  {
    statement: "Quel hook permet de gérer l'état local dans un composant React ?",
    choices: [
      { text: "useState", isCorrect: true },
      { text: "useRender", isCorrect: false },
      { text: "useData", isCorrect: false },
    ],
  },
  {
    statement: "Quel middleware Express permet de parser le JSON dans les requêtes ?",
    choices: [
      { text: "express.json()", isCorrect: true },
      { text: "express.parse()", isCorrect: false },
      { text: "body.json()", isCorrect: false },
    ],
  },
  {
    statement: "Quelle méthode Mongoose permet de créer un nouveau document ?",
    choices: [
      { text: "Model.create()", isCorrect: true },
      { text: "Model.new()", isCorrect: false },
      { text: "Model.insert()", isCorrect: false },
    ],
  },
  {
    statement: "Que signifie l'acronyme UX ?",
    choices: [
      { text: "User Experience", isCorrect: true },
      { text: "User Extension", isCorrect: false },
      { text: "Unified Xperience", isCorrect: false },
    ],
  },
  {
    statement: "Quelle bibliothèque Python est utilisée pour manipuler des DataFrames ?",
    choices: [
      { text: "Pandas", isCorrect: true },
      { text: "NumPy", isCorrect: false },
      { text: "Matplotlib", isCorrect: false },
    ],
  },
  {
    statement: "Quel algorithme est utilisé pour la classification supervisée ?",
    choices: [
      { text: "SVM (Support Vector Machine)", isCorrect: true },
      { text: "K-Means", isCorrect: false },
      { text: "PCA", isCorrect: false },
    ],
  },
  {
    statement: "Quel outil permet de conteneuriser une application ?",
    choices: [
      { text: "Docker", isCorrect: true },
      { text: "Jenkins", isCorrect: false },
      { text: "Git", isCorrect: false },
    ],
  },
  {
    statement: "Quelle faille permet d'injecter du code malveillant via un formulaire web ?",
    choices: [
      { text: "XSS (Cross-Site Scripting)", isCorrect: true },
      { text: "DNS Spoofing", isCorrect: false },
      { text: "ARP Poisoning", isCorrect: false },
    ],
  },
  {
    statement: "Quel design pattern garantit qu'une classe n'a qu'une seule instance ?",
    choices: [
      { text: "Singleton", isCorrect: true },
      { text: "Factory", isCorrect: false },
      { text: "Observer", isCorrect: false },
    ],
  },
  {
    statement: "Quel langage est utilisé pour écrire une application Flutter ?",
    choices: [
      { text: "Dart", isCorrect: true },
      { text: "Kotlin", isCorrect: false },
      { text: "Swift", isCorrect: false },
    ],
  },
];

const questions = [];
const correctChoiceByQuestion = [];
for (let i = 0; i < NB; i++) {
  const question = await Question.create({
    Quiz: quizzes[i]._id,
    statement: questionData[i].statement,
    status: "MCQ",
    point: 2,
    order: 1,
  });
  questions.push(question);

  const choices = await Choice.create(
    questionData[i].choices.map((c, idx) => ({
      question: question._id,
      text: c.text,
      isCorrect: c.isCorrect,
      order: idx + 1,
    }))
  );
  correctChoiceByQuestion.push(choices.find((c) => c.isCorrect));
}
console.log(`✅ ${NB} Questions (+ Choices) créées.`);

   // 13. Inscriptions (10)
const statuses = ["completed", "active", "completed", "active", "active", "completed", "active", "active", "completed", "active"];

for (let i = 0; i < NB; i++) {
  await Inscription.create({
    student: students[i]._id,
    cours: coursList[i]._id,
    enrolledAt: new Date(),
    status: statuses[i],
  });
}
console.log(`✅ ${NB} Inscriptions créées.`);
    // 14. QuizAttempts (10) — scores variés
const scores = [95, 62, 78, 88, 55, 92, 70, 45, 83, 67];

const attempts = [];
for (let i = 0; i < NB; i++) {
  const attempt = await QuizAttempt.create({
    student: students[i]._id,
    Quiz: quizzes[i]._id,
    score: scores[i],
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