const express = require('express');
const {
  getPosts,
  searchPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  votePost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const commentRouter = require('./commentRoutes');

const router = express.Router();

// Re-route into comment router
router.use('/:postId/comments', commentRouter);

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.get('/search', searchPosts);

router.route('/:id')
  .get(getPostById)
  .patch(protect, updatePost)
  .delete(protect, deletePost);

router.route('/:id/vote')
  .post(protect, votePost)
  .delete(protect, votePost); // Toggle support via DELETE as well

module.exports = router;
