import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function FlashcardsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [currentDeck, setCurrentDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchFlashcards();
  }, []);

  const fetchSessions = async () => {
    try {
      console.log('[Flashcards] Fetching sessions...');
      const data = await api.getSessions();
      console.log('[Flashcards] Sessions received:', data);
      setSessions(data.sessions || []);
      console.log('[Flashcards] Sessions state updated:', data.sessions?.length || 0, 'sessions');
    } catch (error) {
      console.error('[Flashcards] Failed to fetch sessions:', error);
      console.error('[Flashcards] Error details:', error.message);
    }
  };

  const fetchFlashcards = async () => {
    try {
      const data = await api.getFlashcards();
      setFlashcards(data.flashcards || []);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    }
  };

  const generateFlashcards = async () => {
    if (!selectedSession) return;
    setLoading(true);
    try {
      const data = await api.generateFlashcards(selectedSession, 10, 'medium');
      alert('Flashcards generated successfully!');
      fetchFlashcards();
    } catch (error) {
      alert('Failed to generate flashcards: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const reviewCard = async (confidence) => {
    if (!currentDeck) return;
    try {
      await api.reviewFlashcard(currentDeck._id, currentCardIndex, confidence);
      nextCard();
    } catch (error) {
      console.error('Failed to review card:', error);
    }
  };

  const nextCard = () => {
    if (currentDeck && currentCardIndex < currentDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      alert('Deck complete! Great job! 🎉');
      setCurrentDeck(null);
      setCurrentCardIndex(0);
    }
  };

  const studyDeck = (deck) => {
    setCurrentDeck(deck);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const deleteDeck = async (id) => {
    if (!confirm('Delete this flashcard deck?')) return;
    try {
      await api.deleteFlashcardDeck(id);
      fetchFlashcards();
    } catch (error) {
      alert('Failed to delete deck');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">🎴 Flashcards</h1>
          <p className="text-gray-600">Study smart with AI-generated flashcards and spaced repetition</p>
        </div>

        {/* Generate Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-800">Generate New Flashcards</h2>
          
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
            <p className="font-semibold mb-1">Debug Info:</p>
            <p>Sessions loaded: {sessions.length}</p>
            <p>Selected: {selectedSession || 'None'}</p>
            {sessions.length === 0 && (
              <p className="text-orange-600 mt-2">
                ⚠️ No documents found. Please upload a document from the Dashboard first.
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
            >
              <option value="">Select a document...</option>
              {sessions.map(s => (
                <option key={s.session_id} value={s.session_id}>
                  {s.filename} ({new Date(s.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
            <button
              onClick={generateFlashcards}
              disabled={!selectedSession || loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all shadow-lg"
            >
              {loading ? 'Generating...' : '✨ Generate'}
            </button>
          </div>
        </div>

        {/* Study Mode */}
        {currentDeck && currentDeck.cards[currentCardIndex] && (
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{currentDeck.deck_name}</h3>
              <span className="bg-white/20 px-4 py-2 rounded-full">
                Card {currentCardIndex + 1} / {currentDeck.cards.length}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-8 min-h-[300px] flex flex-col justify-center items-center text-gray-800">
              <div className="text-center mb-6">
                <p className="text-sm text-purple-600 font-semibold mb-2">
                  {showAnswer ? 'ANSWER' : 'QUESTION'}
                </p>
                <p className="text-2xl font-semibold">
                  {showAnswer 
                    ? currentDeck.cards[currentCardIndex].answer
                    : currentDeck.cards[currentCardIndex].question
                  }
                </p>
              </div>

              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
                >
                  Show Answer
                </button>
              ) : (
                <div className="flex gap-3 flex-wrap justify-center">
                  <button onClick={() => reviewCard(1)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    😕 Hard
                  </button>
                  <button onClick={() => reviewCard(3)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                    🤔 Medium
                  </button>
                  <button onClick={() => reviewCard(5)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    😊 Easy
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setCurrentDeck(null)}
              className="mt-4 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
            >
              Exit Study Mode
            </button>
          </div>
        )}

        {/* Flashcard Decks */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map(deck => (
            <div key={deck._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-purple-900">{deck.deck_name}</h3>
                <button onClick={() => deleteDeck(deck._id)} className="text-red-500 hover:text-red-700">
                  🗑️
                </button>
              </div>
              <p className="text-gray-600 mb-4">{deck.cards.length} cards</p>
              <div className="flex gap-2">
                <button
                  onClick={() => studyDeck(deck)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  📚 Study
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Created {new Date(deck.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {flashcards.length === 0 && !currentDeck && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">📚 No flashcards yet</p>
            <p>Generate your first deck from a document above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
