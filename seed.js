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

    // 2. Upsert mode (non-destructive)
    // We avoid wiping collections here. Instead we will upsert records so seeding is idempotent.
    console.log("ℹ️ Seeding in upsert mode — existing data preserved.");

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
  const dep = await Departement.findOneAndUpdate(
    { name: departementNames[i].name },
    { $set: { description: departementNames[i].description, createdAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  departements.push(dep);
}
console.log(`✅ ${NB} Departements upserted/created.`);

    // 5. Admins (2)
    const admins = [];
    for (let i = 1; i <= NB_ADMINS; i++) {
      const admin = await Admin.findOneAndUpdate(
        { email: `admin${i}@insight.com` },
        {
          $set: {
            firstName: `Admin${i}`,
            lastName: "System",
            password: hashedPassword,
            permissions: ["ALL_PERMISSIONS"],
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      admins.push(admin);
    }
    console.log(`✅ ${NB_ADMINS} Admins upserted/created.`);

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
  const email = `${teacherNames[i].firstName.toLowerCase()}.${teacherNames[i].lastName.toLowerCase()}@insight.com`;
  const teacher = await Teacher.findOneAndUpdate(
    { email },
    {
      $set: {
        firstName: teacherNames[i].firstName,
        lastName: teacherNames[i].lastName,
        password: hashedPassword,
        speciality: teacherNames[i].speciality,
        office: `B-${200 + i}`,
        department: departements[i % departements.length]._id,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  teachers.push(teacher);
}
console.log(`✅ ${NB} Teachers upserted/created.`);

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
  const email = `${studentNames[i].firstName.toLowerCase()}.${studentNames[i].lastName.toLowerCase()}@insight.com`;
  const student = await Student.findOneAndUpdate(
    { email },
    {
      $set: {
        firstName: studentNames[i].firstName,
        lastName: studentNames[i].lastName,
        password: hashedPassword,
        studentCode: `ETU${String(i + 1).padStart(4, "0")}`,
        level: LEVELS[i % LEVELS.length],
        group: `G${(i % 3) + 1}`,
        department: departements[i]._id,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  students.push(student);
}
console.log(`✅ ${NB} Students upserted/created.`);

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
    const cours = await Cours.findOneAndUpdate(
    { Title: coursData[i].Title },
    {
      $set: {
        Description: coursData[i].Description,
        Department: departements[i]._id,
        Teacher: teachers[teacherAssignment[i]]._id,
        Duration: `${20 + i * 2}h`,
        Level: coursData[i].Level,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  coursList.push(cours);
}
console.log(`✅ ${NB} Cours upserted/created.`);

    // 9. Modules (10)
    const modules = [];
    for (let i = 1; i <= NB; i++) {
      const coursRef = coursList[i % coursList.length];
      const mod = await Module.findOneAndUpdate(
        { title: `Module ${i}`, cours: coursRef._id },
        { $set: { description: `Description du module ${i}`, order: i, createdAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      modules.push(mod);
    }
    console.log(`✅ ${NB} Modules upserted/created.`);

    // 10. Lessons (10)
    for (let i = 1; i <= NB; i++) {
      const moduleRef = modules[i % modules.length];
      await Lesson.findOneAndUpdate(
        { title: `Leçon ${i}`, module: moduleRef._id },
        { $set: { content: `<h1>Leçon ${i}</h1><p>Contenu de la leçon ${i}...</p>`, order: String(i), createdAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`✅ ${NB} Lessons upserted/created.`);

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
  const q = await Quiz.findOneAndUpdate(
    { title: quizData[i].title },
    { $set: { cours: coursList[i]._id, description: quizData[i].description, duration: 15, passingScore: 60, isPublished: true, createdBy: teachers[i]._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  quizzes.push(q);
}
console.log(`✅ ${NB} Quizzes upserted/created.`);

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
  const question = await Question.findOneAndUpdate(
    { statement: questionData[i].statement, Quiz: quizzes[i]._id },
    { $set: { status: "MCQ", point: 2, order: 1, Quiz: quizzes[i]._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  questions.push(question);

  const createdChoices = [];
  for (let idx = 0; idx < questionData[i].choices.length; idx++) {
    const c = questionData[i].choices[idx];
    const choice = await Choice.findOneAndUpdate(
      { question: question._id, text: c.text },
      { $set: { isCorrect: c.isCorrect, order: idx + 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdChoices.push(choice);
  }
  correctChoiceByQuestion.push(createdChoices.find((c) => c.isCorrect));
}
console.log(`✅ ${NB} Questions (+ Choices) upserted/created.`);
// 13. Inscriptions — كل student يظهر مرتين: مرة completed, مرة active
const enrollmentPairs = [
  { student: 0, cours: 0 }, { student: 0, cours: 1 },
  { student: 1, cours: 0 }, { student: 1, cours: 2 },
  { student: 2, cours: 0 }, { student: 2, cours: 3 },
  { student: 3, cours: 1 }, { student: 3, cours: 4 },
  { student: 4, cours: 1 }, { student: 4, cours: 5 },
  { student: 5, cours: 2 }, { student: 5, cours: 6 },
  { student: 6, cours: 3 }, { student: 6, cours: 7 },
  { student: 7, cours: 3 }, { student: 7, cours: 8 },
  { student: 8, cours: 4 }, { student: 8, cours: 9 },
  { student: 9, cours: 5 }, { student: 9, cours: 6 },
];

// أول inscription لكل student = completed (Review), الثانية = active (Continue)
const statuses = enrollmentPairs.map((_, i) => (i % 2 === 0 ? "completed" : "active"));

for (let i = 0; i < enrollmentPairs.length; i++) {
  const existing = await Inscription.findOne({ student: students[enrollmentPairs[i].student]._id, cours: coursList[enrollmentPairs[i].cours]._id });
  if (!existing) {
    await Inscription.create({
      student: students[enrollmentPairs[i].student]._id,
      cours: coursList[enrollmentPairs[i].cours]._id,
      enrolledAt: new Date(),
      status: statuses[i],
    });
  }
}
console.log(`✅ ${enrollmentPairs.length} Inscriptions ensured.`);
    // 14. QuizAttempts (10) — scores variés
const scores = [95, 62, 78, 88, 55, 92, 70, 45, 83, 67];

const attempts = [];
for (let i = 0; i < NB; i++) {
  const attempt = await QuizAttempt.findOneAndUpdate(
    { student: students[i]._id, Quiz: quizzes[i]._id },
    { $set: { score: scores[i], totalQuestions: 1, staredAt: new Date(), submitteAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  attempts.push(attempt);
}
console.log(`✅ ${NB} QuizAttempts upserted/created.`);

    // 15. Answers (10) — une réponse (correcte) par attempt, liée à la question du quiz correspondant
    for (let i = 0; i < NB; i++) {
      await Answer.findOneAndUpdate(
        { attempt: attempts[i]._id, question: questions[i]._id },
        { $set: { selectedChoice: correctChoiceByQuestion[i]._id, isCorrect: true, pointsEarned: questions[i].point } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`✅ ${NB} Answers upserted/created.`);

    // 16. Notifications (10) — pour les students
    for (let i = 0; i < NB; i++) {
      await Notification.findOneAndUpdate(
        { user: students[i]._id, title: `Notification ${i + 1}` },
        { $set: { message: `Vous avez une nouvelle activité sur le cours ${i + 1}.`, type: "info", isRead: false, createdAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`✅ ${NB} Notifications upserted/created.`);

    // 17. Recommendations (10) — pour les students
    for (let i = 0; i < NB; i++) {
      await Recommendation.findOneAndUpdate(
        { student: students[i]._id, message: `Nous vous recommandons de revoir le module ${i + 1}.` },
        { $set: { type: "revision", confidenceScore: 0.75, createdAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`✅ ${NB} Recommendations upserted/created.`);

    // 18. PerformanceMetrics (10) — pour les students
    for (let i = 0; i < NB; i++) {
      await PerformanceMetric.findOneAndUpdate(
        { student: students[i]._id, Cours: coursList[i % coursList.length]._id, weekname: `Semaine ${i + 1}` },
        { $set: { quizScorreAverage: 75, attendanceRate: 90, createdAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`✅ ${NB} PerformanceMetrics upserted/created.`);

    // 19. AuditLogs (10) — actions des admins/teachers
    for (let i = 0; i < NB; i++) {
      const actor = i % 2 === 0 ? admins[i % admins.length] : teachers[i % teachers.length];
      await AuditLog.findOneAndUpdate(
        { user: actor._id, action: "CREATE", entity: "Cours", entityId: coursList[i % coursList.length]._id },
        { $set: { ipAddress: "127.0.0.1" } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`✅ ${NB} AuditLogs upserted/created.`);

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