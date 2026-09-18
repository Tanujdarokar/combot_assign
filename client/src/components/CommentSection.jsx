import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MessageSquare, Send, Reply, Edit2, Trash2, Check, X } from 'lucide-react';

export const CommentSection = ({ postId, showToast, onRequireAuth }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/posts/${postId}/comments`, { content: newComment });
      if (response.data.success) {
        setNewComment('');
        setComments([...comments, response.data.data]);
        showToast('Comment added successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add comment', 'error');
    }
  };

  const handleAddReply = async (parentCommentId) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!replyContent.trim()) return;

    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: replyContent,
        parentComment: parentCommentId
      });
      if (response.data.success) {
        setReplyContent('');
        setReplyingTo(null);
        setComments([...comments, response.data.data]);
        showToast('Reply added successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add reply', 'error');
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const response = await api.patch(`/comments/${commentId}`, { content: editContent });
      if (response.data.success) {
        setComments(comments.map((c) => (c._id === commentId ? response.data.data : c)));
        setEditingId(null);
        showToast('Comment updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const response = await api.delete(`/comments/${commentId}`);
      if (response.data.success) {
        setComments(comments.filter((c) => c._id !== commentId && c.parentComment !== commentId));
        showToast('Comment deleted successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete comment', 'error');
    }
  };

  // Group comments into root comments and their replies
  const rootComments = comments.filter((c) => !c.parentComment);
  const getReplies = (parentId) => comments.filter((c) => c.parentComment === parentId);

  const currentUserId = user?.id || user?._id;

  return (
    <div className="space-y-6 pt-6 border-t border-gray-100">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-brand-600" />
        <h3 className="text-lg font-semibold text-gray-900">Discussion ({comments.length})</h3>
      </div>

      {/* Add comment box */}
      <form onSubmit={handleAddComment} className="space-y-3">
        <textarea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Join the discussion (Markdown supported)..." : "Sign in to join the discussion..."}
          disabled={!user}
          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-end">
          {user ? (
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-xl shadow-sm transition"
            >
              <Send className="w-4 h-4" />
              Post Comment
            </button>
          ) : (
            <button
              type="button"
              onClick={onRequireAuth}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-xl transition"
            >
              Sign in to Comment
            </button>
          )}
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-6 text-sm text-gray-400">Loading comments...</div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-sm">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(comment._id);
            const isAuthor = currentUserId && (comment.author?._id?.toString() === currentUserId.toString() || comment.author?.toString() === currentUserId.toString());
            const isAdmin = user?.role === 'admin';

            return (
              <div key={comment._id} className="bg-white border border-gray-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center font-semibold text-xs">
                      {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {comment.author?.name || 'Anonymous'}
                        </span>
                        {comment.author?.role === 'admin' && (
                          <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-xs font-semibold rounded-md">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {(isAuthor || isAdmin) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(comment._id);
                          setEditContent(comment.content);
                        }}
                        className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === comment._id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        className="px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-600"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </div>

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <div className="pl-6 pt-3 border-t border-gray-100 space-y-2">
                    <textarea
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        className="px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg"
                      >
                        Post Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies */}
                {replies.length > 0 && (
                  <div className="pl-6 sm:pl-10 space-y-3 pt-3 border-t border-gray-100">
                    {replies.map((reply) => {
                      const isReplyAuthor = currentUserId && (reply.author?._id?.toString() === currentUserId.toString() || reply.author?.toString() === currentUserId.toString());
                      return (
                        <div key={reply._id} className="bg-gray-50/80 border border-gray-200/60 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center font-semibold text-xs">
                                {reply.author?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-900">
                                  {reply.author?.name || 'Anonymous'}
                                </span>
                                <span className="block text-[10px] text-gray-400">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {(isReplyAuthor || isAdmin) && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
