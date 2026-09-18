const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feature_portal';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();

    console.log('Existing collections cleared.');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpassword123',
      role: 'admin',
      isEmailVerified: true
    });

    const sarah = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: 'userpassword123',
      role: 'user',
      isEmailVerified: true
    });

    const alex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'userpassword123',
      role: 'user',
      isEmailVerified: true
    });

    console.log('Users created: Admin (admin@example.com), Sarah (sarah@example.com), Alex (alex@example.com)');

    // Create feature posts
    const post1 = await Post.create({
      title: 'Dark Mode Theme Support',
      description: 'Please add a system-wide dark mode toggle to reduce eye strain during late-night productivity sessions. It should match the system preference automatically.',
      category: 'UI/UX',
      status: 'Planned',
      author: sarah._id,
      votes: 3,
      voters: [admin._id, sarah._id, alex._id],
      commentCount: 2
    });

    const post2 = await Post.create({
      title: 'GitHub Integration for Pull Requests',
      description: 'Allow linking feature requests directly to GitHub issues and pull requests, automatically updating status to "In Progress" or "Completed" when merged.',
      category: 'Integrations',
      status: 'In Progress',
      author: alex._id,
      votes: 2,
      voters: [sarah._id, alex._id],
      commentCount: 1
    });

    const post3 = await Post.create({
      title: 'Redis Caching for High-Concurrency Feed',
      description: 'Implement distributed Redis caching on the feed and roadmap queries to reduce MongoDB read latency to under 10ms at scale.',
      category: 'Performance',
      status: 'Completed',
      author: admin._id,
      votes: 3,
      voters: [admin._id, sarah._id, alex._id],
      commentCount: 1
    });

    const post4 = await Post.create({
      title: 'Custom Webhook Notifications',
      description: 'Send HTTP POST webhooks to custom endpoints whenever a feature status changes or a new upvote threshold is reached.',
      category: 'Integrations',
      status: 'Under Review',
      author: alex._id,
      votes: 1,
      voters: [alex._id],
      commentCount: 0
    });

    const post5 = await Post.create({
      title: 'Export Public Roadmap to PDF and PNG',
      description: 'Enable product managers to export the current Kanban roadmap view as high-resolution PNG or PDF for investor and stakeholder presentations.',
      category: 'General',
      status: 'Under Review',
      author: sarah._id,
      votes: 2,
      voters: [admin._id, sarah._id],
      commentCount: 0
    });

    const post6 = await Post.create({
      title: 'Slack and Discord Notification Bot',
      description: 'Official Slack and Discord app bots that post weekly summaries and real-time upvote alerts into designated community channels.',
      category: 'Integrations',
      status: 'Completed',
      author: admin._id,
      votes: 3,
      voters: [admin._id, sarah._id, alex._id],
      commentCount: 0
    });

    // Create comments and replies
    const comment1 = await Comment.create({
      post: post1._id,
      author: alex._id,
      content: 'Strongly agree! OLED black theme would look incredible alongside the brand purple accents.',
      parentComment: null
    });

    await Comment.create({
      post: post1._id,
      author: admin._id,
      content: 'Thanks for the feedback! We have scheduled this for next sprint and our designer is already prepping Figma tokens.',
      parentComment: comment1._id
    });

    await Comment.create({
      post: post2._id,
      author: sarah._id,
      content: 'Would love to see automatic branch name generator from feature IDs too!',
      parentComment: null
    });

    await Comment.create({
      post: post3._id,
      author: alex._id,
      content: 'Deployed this and response time dropped from 140ms to 8ms. Stellar improvement!',
      parentComment: null
    });

    console.log('Database successfully seeded with realistic demo data!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
