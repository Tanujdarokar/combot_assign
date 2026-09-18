import React, { useState, useEffect } from 'react';
import { ChevronUp, MessageSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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

const isVotedByUser = (votersList, uid) => {
  if (!votersList || !uid) return false;
  return votersList.some((v) => (v._id || v).toString() === uid.toString());
};

export const FeatureCard = ({ post, onVoteChange, onRequireAuth }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentUserId = user?.id || user?._id;

  const [votes, setVotes] = useState(post.votes || 0);
  const [hasVoted, setHasVoted] = useState(isVotedByUser(post.voters, currentUserId));
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    setVotes(post.votes || 0);
    setHasVoted(isVotedByUser(post.voters, currentUserId));
  }, [post.votes, post.voters, currentUserId]);

  const handleVoteClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    // Optimistic UI state
    const previousVotes = votes;
    const previousHasVoted = hasVoted;

    const newHasVoted = !hasVoted;
    const newVotes = newHasVoted ? votes + 1 : votes - 1;

    setHasVoted(newHasVoted);
    setVotes(newVotes);

    try {
      const method = previousHasVoted ? 'delete' : 'post';
      const response = await api[method](`/posts/${post._id}/vote`);
      if (response.data.success) {
        setVotes(response.data.votes);
        setHasVoted(response.data.hasVoted);
        if (onVoteChange) onVoteChange(post._id, response.data.votes, response.data.hasVoted);
      }
    } catch (err) {
      // Rollback on failure
      setVotes(previousVotes);
      setHasVoted(previousHasVoted);
      console.error('Voting failed:', err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/posts/${post._id}`)}
      className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-brand-300 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
    >
      <div className="flex items-start gap-4 flex-1">
        {/* Upvote Button */}
        <button
          onClick={handleVoteClick}
          className={`flex flex-col items-center justify-center min-w-[56px] py-2.5 px-3 rounded-xl border transition ${
            hasVoted
              ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600'
          }`}
        >
          <ChevronUp className={`w-5 h-5 ${hasVoted ? 'text-white' : 'text-gray-500 group-hover:text-brand-600'}`} />
          <span className="text-sm font-bold mt-0.5">{votes}</span>
        </button>

        {/* Content */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusColors[post.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {post.status}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
              {post.category}
            </span>
          </div>

          <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition">
            {post.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2">
            {post.description}
          </p>

          <div className="flex items-center gap-4 pt-1 text-xs text-gray-400">
            <span>By {post.author?.name || 'Anonymous'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Comment Count */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-medium self-end sm:self-center">
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <span>{post.commentCount || 0}</span>
      </div>
    </div>
  );
};
