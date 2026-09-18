import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ChevronUp, ArrowLeft, Clock, Trash2 } from 'lucide-react';
import { CommentSection } from '../components/CommentSection';

const statusColors = {
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Planned': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

const categoryColors = {
  'UI/UX': 'bg-pink-50 text-pink-700',
  'Integrations': 'bg-indigo-50 text-indigo-700',
  'Performance': 'bg-teal-50 text-teal-700',
  'General': 'bg-gray-100 text-gray-700'
};

export const FeatureDetailPage = ({ showToast, onRequireAuth }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.id || user?._id;
  const initialHasVoted = post?.voters && currentUserId ? post.voters.includes(currentUserId) : false;

  const [votes, setVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        if (response.data.success) {
          const p = response.data.data;
          setPost(p);
          setVotes(p.votes);
          setHasVoted(currentUserId && p.voters ? p.voters.some(v => (v._id || v).toString() === currentUserId.toString()) : false);
        }
      } catch (err) {
        showToast('Feature request not found', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, currentUserId, navigate, showToast]);

  const handleVoteClick = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (isVoting) return;
    setIsVoting(true);

    const prevVotes = votes;
    const prevHasVoted = hasVoted;
    const newHasVoted = !hasVoted;
    const newVotes = newHasVoted ? votes + 1 : votes - 1;

    setHasVoted(newHasVoted);
    setVotes(newVotes);

    try {
      const method = prevHasVoted ? 'delete' : 'post';
      const response = await api[method](`/posts/${id}/vote`);
      if (response.data.success) {
        setVotes(response.data.votes);
        setHasVoted(response.data.hasVoted);
      }
    } catch (err) {
      setVotes(prevVotes);
      setHasVoted(prevHasVoted);
      showToast('Voting failed', 'error');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this feature request?')) return;
    try {
      await api.delete(`/posts/${id}`);
      showToast('Feature request deleted', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  const isAuthor = currentUserId && (post.author?._id?.toString() === currentUserId.toString() || post.author?.toString() === currentUserId.toString());
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </button>

      {/* Main Details Card */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleVoteClick}
              className={`flex flex-col items-center justify-center min-w-[64px] py-3 px-4 rounded-2xl border transition ${
                hasVoted
                  ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600'
              }`}
            >
              <ChevronUp className={`w-6 h-6 ${hasVoted ? 'text-white' : 'text-gray-500'}`} />
              <span className="text-base font-bold mt-0.5">{votes}</span>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[post.status] || 'bg-gray-100 text-gray-700'}`}>
                  {post.status}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                  {post.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{post.title}</h1>
            </div>
          </div>

          {(isAuthor || isAdmin) && (
            <button
              onClick={handleDeletePost}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Submitted by <strong className="text-gray-800">{post.author?.name || 'Anonymous'}</strong></span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="prose max-w-none text-gray-700 text-base leading-relaxed pt-2 whitespace-pre-wrap">
          {post.description}
        </div>

        {/* Comment Section */}
        <CommentSection postId={id} showToast={showToast} onRequireAuth={onRequireAuth} />
      </div>
    </div>
  );
};
