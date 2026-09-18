const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get all posts with filtering, sorting, search, and pagination
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { category, status, search, sort = 'votes', page = 1, limit = 10 } = req.query;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting logic
    let sortBy = {};
    if (sort === 'votes') {
      sortBy = { votes: -1, createdAt: -1 };
    } else if (sort === 'newest') {
      sortBy = { createdAt: -1 };
    } else if (sort === 'comments') {
      sortBy = { commentCount: -1, createdAt: -1 };
    } else {
      sortBy = { votes: -1 };
    }

    const pageSize = parseInt(limit, 10) || 10;
    const pageNum = parseInt(page, 10) || 1;
    const skip = (pageNum - 1) * pageSize;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort(sortBy)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pages: Math.ceil(total / pageSize),
      currentPage: pageNum,
      data: posts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Search posts specifically for debounced search
// @route   GET /api/posts/search
// @access  Public
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('author', 'name email')
      .limit(10);

    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ success: false, error: 'Feature request not found' });
    }
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create feature request
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, error: 'Please provide title, description and category' });
    }

    const post = await Post.create({
      title,
      description,
      category,
      author: req.user.id
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'name email');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update feature request
// @route   PATCH /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Feature request not found' });
    }

    // Make sure user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this post' });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('author', 'name email');

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete feature request
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Feature request not found' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Upvote feature request (Atomic operation)
// @route   POST /api/posts/:id/vote
// @access  Private
exports.votePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Feature request not found' });
    }

    const hasVoted = post.voters && post.voters.some(v => v.toString() === userId.toString());

    let updatedPost;
    if (hasVoted) {
      // Remove vote ($pull, $inc)
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { voters: userId },
          $inc: { votes: -1 }
        },
        { new: true }
      ).populate('author', 'name email');
    } else {
      // Add vote ($addToSet, $inc)
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $addToSet: { voters: userId },
          $inc: { votes: 1 }
        },
        { new: true }
      ).populate('author', 'name email');
    }

    res.status(200).json({
      success: true,
      votes: updatedPost.votes,
      hasVoted: !hasVoted,
      data: updatedPost
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
