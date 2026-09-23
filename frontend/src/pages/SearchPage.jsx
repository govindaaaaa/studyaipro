import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const search = async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    try {
      const data = await api.search(query, null, 20);
      setResults(data);
    } catch (error) {
      alert('Search failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'session': return '📄';
      case 'note': return '📝';
      case 'chat': return '💬';
      case 'flashcard': return '🎴';
      default: return '🔍';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🔍 Search</h1>
          <p className="text-gray-600">Find anything across all your study materials</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search documents, notes, chats, flashcards..."
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={search}
              disabled={loading || query.trim().length < 2}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
            >
              {loading ? '🔄' : '🔍'} Search
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <p className="text-lg font-semibold text-gray-700">
                Found <span className="text-blue-600">{results.total}</span> results for "{query}"
              </p>
            </div>

            {/* Sessions */}
            {results.sessions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📄 Documents ({results.sessions.length})</h2>
                <div className="space-y-3">
                  {results.sessions.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{getIcon(item.type)}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {results.notes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 Notes ({results.notes.length})</h2>
                <div className="space-y-3">
                  {results.notes.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{getIcon(item.type)}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.excerpt}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {item.mode} • {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chats */}
            {results.chats.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">💬 Chat History ({results.chats.length})</h2>
                <div className="space-y-3">
                  {results.chats.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{getIcon(item.type)}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-600 mb-1">Q: {item.question}</p>
                          <p className="text-sm text-gray-600">{item.answer}</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flashcards */}
            {results.flashcards.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🎴 Flashcards ({results.flashcards.length})</h2>
                <div className="space-y-3">
                  {results.flashcards.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{getIcon(item.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">{item.deck_name}</p>
                          <p className="font-semibold">Q: {item.question}</p>
                          <p className="text-sm text-gray-600 mt-1">A: {item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.total === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl text-gray-600">No results found for "{query}"</p>
                <p className="text-gray-500 mt-2">Try different keywords or check your spelling</p>
              </div>
            )}
          </div>
        )}

        {!results && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 mb-2">Start searching</p>
            <p className="text-gray-500">Find documents, notes, chats, and flashcards instantly</p>
          </div>
        )}
      </div>
    </div>
  );
}
