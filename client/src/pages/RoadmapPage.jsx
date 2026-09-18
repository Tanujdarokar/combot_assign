import React, { useState, useEffect } from 'react';
import { Map, ChevronUp, Clock } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const columns = [
  { id: 'Planned', title: 'Planned', color: 'border-blue-500 bg-blue-50/50 text-blue-800' },
  { id: 'In Progress', title: 'In Progress', color: 'border-purple-500 bg-purple-50/50 text-purple-800' },
  { id: 'Completed', title: 'Completed', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-800' }
];

export const RoadmapPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmapPosts = async () => {
      try {
        // Fetch posts matching roadmap statuses
        const response = await api.get('/posts?limit=100');
        if (response.data.success) {
          setPosts(response.data.data.filter(p => ['Planned', 'In Progress', 'Completed'].includes(p.status)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmapPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold">
          <Map className="w-3.5 h-3.5" />
          Public Product Roadmap
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">What we are building</h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto">
          Explore our public roadmap and see what features are planned, in progress, or recently shipped.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 h-96 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const columnPosts = posts.filter(p => p.status === col.id);

            return (
              <div key={col.id} className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col">
                <div className={`px-4 py-3 rounded-2xl border-l-4 font-bold text-sm flex items-center justify-between ${col.color}`}>
                  <span>{col.title}</span>
                  <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold shadow-xs">
                    {columnPosts.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {columnPosts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      No features in this status yet.
                    </div>
                  ) : (
                    columnPosts.map((post) => (
                      <div
                        key={post._id}
                        onClick={() => navigate(`/posts/${post._id}`)}
                        className="bg-white border border-gray-200/80 hover:border-brand-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                            <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                            <span>{post.votes}</span>
                          </div>
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition">
                          {post.title}
                        </h3>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {post.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                          <span>By {post.author?.name || 'Anonymous'}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
