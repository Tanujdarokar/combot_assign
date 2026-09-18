const express = require('express');
const {
  getComments,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getComments)
  .post(protect, createComment);

router.route('/:id')
  .patch(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
