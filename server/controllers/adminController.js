const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();

    const posts = await Post.find();
    const totalVotes = posts.reduce((acc, post) => acc + (post.votes || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        totalComments,
        totalVotes
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update feature request status (Roadmap management)
// @route   PATCH /api/admin/posts/:id/status
// @access  Private/Admin
exports.updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Under Review', 'Planned', 'In Progress', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Feature request not found' });
    }

    post.status = status;
    await post.save();

    const updatedPost = await Post.findById(post._id).populate('author', 'name email');

    res.status(200).json({ success: true, data: updatedPost });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Admin delete post
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
exports.adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Feature request not found' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all comments for moderation
// @route   GET /api/admin/comments
// @access  Private/Admin
exports.getAdminComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('author', 'name email')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
