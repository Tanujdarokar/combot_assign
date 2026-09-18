const express = require('express');
const {
  getAdminStats,
  updatePostStatus,
  adminDeletePost,
  getAdminComments
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getAdminStats);
router.patch('/posts/:id/status', updatePostStatus);
router.delete('/posts/:id', adminDeletePost);
router.get('/comments', getAdminComments);

module.exports = router;
