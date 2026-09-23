import { useState, useEffect } from 'react';
import { api } from '../api';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    fetchBookmarks();
    fetchFolders();
  }, [filter]);

  const fetchBookmarks = async () => {
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const data = await api.getBookmarks(filter !== 'all' ? filter : null);
      setBookmarks(data.bookmarks || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const data = await api.getBookmarkFolders();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const deleteBookmark = async (id) => {
    if (!confirm('Delete this bookmark?')) return;
    try {
      await api.deleteBookmark(id);
      fetchBookmarks();
    } catch (error) {
      alert('Failed to delete bookmark');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'session': return '📄';
      case 'note': return '📝';
      case 'flashcard': return '🎴';
      case 'chat': return '💬';
      default: return '⭐';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-900 mb-2">⭐ Bookmarks</h1>
          <p className="text-gray-600">Your favorite study materials in one place</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            {['all', 'session', 'note', 'flashcard', 'chat'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === type
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map(bookmark => (
            <div key={bookmark._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{getIcon(bookmark.item_type)}</div>
                <button
                  onClick={() => deleteBookmark(bookmark._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
              <h3 className="font-bold text-lg text-orange-900 mb-2">{bookmark.title}</h3>
              {bookmark.description && (
                <p className="text-gray-600 text-sm mb-3">{bookmark.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                {bookmark.tags && bookmark.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{bookmark.folder}</span>
                <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {bookmarks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">⭐ No bookmarks yet</p>
            <p>Start bookmarking your important study materials!</p>
          </div>
        )}
      </div>
    </div>
  );
}
