// controllers/dashboardController.js
const Inscription = require("../models/Inscription");
const QuizAttempt = require("../models/QuizAttempt");
const PerformanceMetric = require("../models/PerformanceMetric");
const Cours = require("../models/Cours");
const User = require("../models/User");

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

    res.status(200).json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalInscriptions,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate admin dashboard.", error: err.message });
  }
};