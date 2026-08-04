// controllers/notificationController.js
const Notification = require("../models/Notification");

// Ajouter une notification
exports.ajouterNotification = async (req, res) => {
  try {
    const nouvelleNotification = new Notification(req.body);
    await nouvelleNotification.save();
    res.status(201).json(nouvelleNotification);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer toutes les notifications (avec pagination)
exports.listerNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .populate("user")
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments();

    res.json({
      notifications,
      totalNotifications,
      page,
      totalPages: Math.ceil(totalNotifications / limit),
      limit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Récupérer une notification par ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate("user");
    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour une notification (ex: marquer comme lue)
exports.updateNotification = async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    res.json(updatedNotification);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    res.json({ message: "Notification supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};
exports.markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.status(200).json({ success: true, data: notif });
  } catch (error) { next(error); }
};
