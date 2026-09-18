import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, Users, Lightbulb, MessageSquare, ThumbsUp, Trash2, Edit3 } from 'lucide-react';

const statuses = ['Under Review', 'Planned', 'In Progress', 'Completed'];

export const AdminDashboardPage = ({ showToast }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalComments: 0, totalVotes: 0 });
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, postsRes, commentsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/posts?limit=50'),
        api.get('/admin/comments')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (postsRes.data.success) setPosts(postsRes.data.data);
      if (commentsRes.data.success) setComments(commentsRes.data.data);
    } catch (err) {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (postId, newStatus) => {
    try {
      const response = await api.patch(`/admin/posts/${postId}/status`, { status: newStatus });
      if (response.data.success) {
        setPosts(posts.map(p => p._id === postId ? response.data.data : p));
        showToast('Feature status updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this feature request?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
      showToast('Feature request deleted', 'success');
    } catch (err) {
      showToast('Failed to delete post', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      showToast('Comment deleted', 'success');
    } catch (err) {
      showToast('Failed to delete comment', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage feature requests, roadmap statuses, and moderation</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.totalUsers}</div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Feature Requests</span>
            <Lightbulb className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.totalPosts}</div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Votes</span>
            <ThumbsUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.totalVotes}</div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Comments</span>
            <MessageSquare className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.totalComments}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
            activeTab === 'posts' ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Manage Features ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
            activeTab === 'comments' ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Moderate Comments ({comments.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading admin data...</div>
      ) : activeTab === 'posts' ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Votes</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-medium text-gray-900 max-w-xs truncate">{post.title}</td>
                    <td className="p-4 text-gray-600">{post.author?.name || 'Anonymous'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">{post.votes}</td>
                    <td className="p-4">
                      <select
                        value={post.status}
                        onChange={(e) => handleStatusChange(post._id, e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-brand-500"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="p-4">Content</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Feature Post</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {comments.map((comment) => (
                  <tr key={comment._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-gray-900 max-w-md truncate">{comment.content}</td>
                    <td className="p-4 text-gray-600">{comment.author?.name || 'Anonymous'}</td>
                    <td className="p-4 text-brand-600 font-medium truncate max-w-xs">{comment.post?.title || 'N/A'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
