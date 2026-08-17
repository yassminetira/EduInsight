// controllers/dashboardController.js
const Inscription = require("../models/Inscription");
const QuizAttempt = require("../models/QuizAttempt");
const PerformanceMetric = require("../models/PerformanceMetric");
const Cours = require("../models/Cours");
const User = require("../models/User");
const Quiz = require("../models/Quiz");

// Dashboard pour un étudiant connecté
exports.generateForStudent = async (req, res) => {
  try {
    const studentId = req.user.id;

    const inscriptions = await Inscription.find({ student: studentId });
    const totalCourses = inscriptions.length;

    const attempts = await QuizAttempt.find({ student: studentId });
    const averageScore =
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length
        : 0;

    const metrics = await PerformanceMetric.find({ student: studentId });
    const attendanceRate =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.attendanceRate || 0), 0) / metrics.length
        : 0;

    const completed = inscriptions.filter((i) => i.status === "completed").length;
    const progress = totalCourses > 0 ? Math.round((completed / totalCourses) * 100) : 0;

    res.status(200).json({
      totalCourses,
      averageScore: Math.round(averageScore * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      progress,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate student dashboard.", error: err.message });
  }
};

// Dashboard pour un enseignant connecté
exports.generateForTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const cours = await Cours.find({ Teacher: teacherId });
    const coursIds = cours.map((c) => c._id);

    const inscriptions = await Inscription.find({ course: { $in: coursIds } });
    const totalStudents = new Set(inscriptions.map((i) => String(i.student))).size;

    res.status(200).json({
      totalCourses: cours.length,
      totalStudents,
      courses: cours.map((c) => ({ id: c._id, title: c.Title })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate teacher dashboard.", error: err.message });
  }
};

// Dashboard pour un admin connecté
exports.generateForAdmin = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalCourses = await Cours.countDocuments();
    const totalInscriptions = await Inscription.countDocuments();

    // Quiz Completion Rate — $group + $cond
    const completionStats = await Inscription.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ]);

    const quizCompletionRate =
      completionStats.length > 0 && completionStats[0].total > 0
        ? Math.round((completionStats[0].completed / completionStats[0].total) * 100)
        : 0;

    // Avg Grade — $group + $avg
    const gradeStats = await QuizAttempt.aggregate([
      { $group: { _id: null, avgGrade: { $avg: "$score" } } },
    ]);
    const avgGrade = gradeStats.length > 0 ? Math.round(gradeStats[0].avgGrade) : 0;

    res.status(200).json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalInscriptions,
      quizCompletionRate,
      avgGrade,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate admin dashboard.", error: err.message });
  }
};

// Analytics détaillées pour l'admin
exports.getAnalytics = async (req, res) => {
  try {
    const totalCourses = await Cours.countDocuments();
    const activeStudents = await User.countDocuments({ role: "student", isActive: true });

    const inscriptionStats = await Inscription.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let completed = 0, active = 0, dropped = 0, totalInscriptions = 0;
    inscriptionStats.forEach((s) => {
      if (s._id === "completed") completed = s.count;
      if (s._id === "active") active = s.count;
      if (s._id === "dropped") dropped = s.count;
      totalInscriptions += s.count;
    });

    const completionRate = totalInscriptions > 0
      ? Math.round((completed / totalInscriptions) * 100)
      : 0;

    const gradeStats = await QuizAttempt.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);
    const avgQuizScore = gradeStats.length > 0 ? Math.round(gradeStats[0].avgScore) : 0;

    const attempts = await QuizAttempt.find();
    const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    attempts.forEach((a) => {
      if (a.score >= 90) gradeDistribution.A++;
      else if (a.score >= 80) gradeDistribution.B++;
      else if (a.score >= 70) gradeDistribution.C++;
      else if (a.score >= 60) gradeDistribution.D++;
      else gradeDistribution.F++;
    });

    res.json({
      completionRate,
      avgQuizScore,
      activeStudents,
      totalCourses,
      gradeDistribution,
      courseCompletion: {
        completed,
        inProgress: active,
        notStarted: dropped,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Progress détaillé pour l'étudiant connecté (par cours)
exports.getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const inscriptions = await Inscription.find({ student: studentId }).populate("cours");

    const coursesCompleted = inscriptions.filter((i) => i.status === "completed").length;

    const progressList = await Promise.all(
      inscriptions.map(async (insc) => {
        if (!insc.cours) return null;

        const quizzes = await Quiz.find({ cours: insc.cours._id });
        const quizIds = quizzes.map((q) => q._id);

        const attempts = await QuizAttempt.find({
          student: studentId,
          Quiz: { $in: quizIds },
        });

        const grade =
          attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
            : null;

        return {
          courseId: insc.cours._id,
          courseTitle: insc.cours.Title,
          grade,
          status: insc.status === "completed" ? "Completed" : "In Progress",
        };
      })
    );

    const validProgress = progressList.filter((p) => p !== null);

    const gradesOnly = validProgress.filter((p) => p.grade !== null).map((p) => p.grade);
    const averageGrade =
      gradesOnly.length > 0
        ? Math.round(gradesOnly.reduce((sum, g) => sum + g, 0) / gradesOnly.length)
        : 0;

    res.json({
      coursesCompleted,
      averageGrade,
      courses: validProgress,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};