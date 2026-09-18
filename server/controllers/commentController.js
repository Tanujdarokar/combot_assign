const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a comment or reply
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const postId = req.params.postId;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Please add comment content' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Feature request not found' });
    }

    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ success: false, error: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user.id,
      content,
      parentComment: parentComment || null
    });

    // Increment post comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name email role');

    res.status(201).json({ success: true, data: populatedComment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update a comment
// @route   PATCH /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this comment' });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true, runValidators: true }
    ).populate('author', 'name email role');

    res.status(200).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this comment' });
    }

    const postId = comment.post;

    // Delete comment and any replies
    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentComment: comment._id }] });

    // Recalculate comment count or decrement
    const remainingCount = await Comment.countDocuments({ post: postId });
    await Post.findByIdAndUpdate(postId, { commentCount: remainingCount });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
