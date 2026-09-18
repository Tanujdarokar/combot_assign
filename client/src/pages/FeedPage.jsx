import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Sparkles, Lightbulb } from 'lucide-react';
import api from '../api/axios';
import { FeatureCard } from '../components/FeatureCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { StatusFilter } from '../components/StatusFilter';
import { SortDropdown } from '../components/SortDropdown';
import { Pagination } from '../components/Pagination';

export const FeedPage = ({ onOpenSubmitModal, onRequireAuth }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('votes');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search query (300-500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 8,
        sort
      });
      if (category !== 'All') params.append('category', category);
      if (status !== 'All') params.append('status', status);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await api.get(`/posts?${params.toString()}`);
      if (response.data.success) {
        setPosts(response.data.data);
        setTotalPages(response.data.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, status, sort, page, debouncedSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-brand-100">
            <Sparkles className="w-3.5 h-3.5" />
            Product Roadmap & Feedback
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Help us shape the future of FeaturePulse
          </h1>
          <p className="text-brand-100 text-sm sm:text-base max-w-xl">
            Vote on feature requests, submit your ideas, and track what we are currently building.
          </p>
        </div>
        <button
          onClick={onOpenSubmitModal}
          className="px-6 py-3.5 bg-white text-brand-600 hover:bg-brand-50 font-semibold rounded-2xl shadow-lg transition flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          Submit Feature Idea
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="space-y-4 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features (e.g. dark mode)..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          <SortDropdown selectedSort={sort} onSelectSort={setSort} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
          <CategoryFilter selectedCategory={category} onSelectCategory={(c) => { setCategory(c); setPage(1); }} />
          <StatusFilter selectedStatus={status} onSelectStatus={(s) => { setStatus(s); setPage(1); }} />
        </div>
      </div>

      {/* Feature Feed List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 h-32 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl space-y-4">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-900">No feature requests found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filters, or submit a new idea!</p>
            </div>
            <button
              onClick={onOpenSubmitModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-medium text-sm rounded-xl shadow-sm hover:bg-brand-700 transition"
            >
              <Plus className="w-4 h-4" />
              Submit Idea
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <FeatureCard
              key={post._id}
              post={post}
              onRequireAuth={onRequireAuth}
            />
          ))
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};
