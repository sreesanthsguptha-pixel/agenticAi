const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const dbConfig = require('../config/db');
const inMemoryStore = require('../config/inMemoryStore');
const Notification = require('../models/Notification');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { isInMemory } = dbConfig.getDBState();
    if (isInMemory) {
      const list = inMemoryStore.find('notifications', { owner: req.user.id.toString() });
      return res.status(200).json({ success: true, data: list });
    } else {
      const list = await Notification.find({ owner: req.user.id }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: list });
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const { isInMemory } = dbConfig.getDBState();
    if (isInMemory) {
      const updated = inMemoryStore.updateById('notifications', req.params.id, { isRead: true });
      return res.status(200).json({ success: true, data: updated });
    } else {
      const updated = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
      return res.status(200).json({ success: true, data: updated });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
