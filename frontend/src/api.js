const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.detail || "Request failed");
  }
  return res.json();
}

async function upload(path, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.detail || "Upload failed");
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password }),
    }),
  me: () => request("/auth/me"),
  changePassword: (currentPassword, newPassword) =>
    request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  refreshToken: () => request("/auth/refresh", { method: "POST" }),

  // Upload
  uploadFile: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return upload("/upload", fd);
  },
  getSessions: () => request("/upload/sessions"),
  getSession: (sessionId) => request(`/upload/sessions/${sessionId}`),
  deleteSession: (sessionId) => request(`/upload/sessions/${sessionId}`, { method: "DELETE" }),

  // Chat
  chat: (session_id, message, k = 5) =>
    request("/chat", { method: "POST", body: JSON.stringify({ session_id, message, k }) }),
  chatContinue: (session_id, message) =>
    request("/chat/continue", { method: "POST", body: JSON.stringify({ session_id, message }) }),
  getChatHistory: (sessionId, limit = 50) => 
    request(`/chat/history/${sessionId}?limit=${limit}`),
  clearChatHistory: (sessionId) => 
    request(`/chat/history/${sessionId}`, { method: "DELETE" }),
  getChatSessions: (limit = 20) => 
    request(`/chat/sessions?limit=${limit}`),

  // Notes
  generateNotes: (session_id, mode = "detailed", title = null) =>
    request("/notes/generate", { 
      method: "POST", 
      body: JSON.stringify({ session_id, mode, title }) 
    }),
  getAllNotes: (limit = 20, skip = 0, session_id = null) => {
    let url = `/notes?limit=${limit}&skip=${skip}`;
    if (session_id) url += `&session_id=${session_id}`;
    return request(url);
  },
  getNote: (noteId) => request(`/notes/${noteId}`),
  getNotesForSession: (sessionId) => request(`/notes/session/${sessionId}`),
  updateNote: (noteId, data) => 
    request(`/notes/${noteId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteNote: (noteId) => request(`/notes/${noteId}`, { method: "DELETE" }),

  // MCQ
  generateMCQ: (session_id, difficulty = "medium", count = 10) =>
    request("/mcq/generate", { 
      method: "POST", 
      body: JSON.stringify({ session_id, difficulty, count }) 
    }),
  submitMCQ: (session_id, difficulty, answers, correct_answers, time_taken_seconds = 0) =>
    request("/mcq/submit", { 
      method: "POST", 
      body: JSON.stringify({ session_id, difficulty, answers, correct_answers, time_taken_seconds }) 
    }),
  getMCQScores: (limit = 20, session_id = null) => {
    let url = `/mcq/scores?limit=${limit}`;
    if (session_id) url += `&session_id=${session_id}`;
    return request(url);
  },
  getMCQScore: (scoreId) => request(`/mcq/scores/${scoreId}`),
  getMCQStats: () => request("/mcq/stats"),
  deleteMCQScore: (scoreId) => request(`/mcq/scores/${scoreId}`, { method: "DELETE" }),

  // Explain
  explain: (text, mode = "Student") =>
    request("/explain", { method: "POST", body: JSON.stringify({ text, mode }) }),
  explainBatch: (text, modes = ["ELI5", "Student", "Expert"]) =>
    request("/explain/batch", { method: "POST", body: JSON.stringify({ text, modes }) }),

  // Process
  generateFlowchart: (text = null, session_id = null) =>
    request("/process/flowchart", { 
      method: "POST", 
      body: JSON.stringify({ text, session_id }) 
    }),
  generateConceptGraph: (text = null, session_id = null) =>
    request("/process/graph", { 
      method: "POST", 
      body: JSON.stringify({ text, session_id }) 
    }),
  generateSummary: (text = null, session_id = null, length = "medium") =>
    request("/process/summary", { 
      method: "POST", 
      body: JSON.stringify({ text, session_id, length }) 
    }),

  // Output
  generatePDF: (note_id = null, title = null, content = null) =>
    request("/output/pdf", { 
      method: "POST", 
      body: JSON.stringify({ note_id, title, content }),
      headers: { "Content-Type": "application/json" }
    }).then(() => {
      // For PDF download, we need to use a different approach
      const token = getToken();
      const url = `${BASE}/output/pdf`;
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ note_id, title, content })
      }).then(res => res.blob());
    }),
  sendEmail: (note_id = null, to_email, title = null, content = null) =>
    request("/output/email", { 
      method: "POST", 
      body: JSON.stringify({ note_id, to_email, title, content }) 
    }),
  sendWhatsApp: (note_id = null, to_number, title = null, content = null) =>
    request("/output/whatsapp", { 
      method: "POST", 
      body: JSON.stringify({ note_id, to_number, title, content }) 
    }),
  downloadNote: (note_id = null, title = null, content = null, format = "txt") =>
    request("/output/download", { 
      method: "POST", 
      body: JSON.stringify({ note_id, title, content, format }) 
    }).then(() => {
      // For file download
      const token = getToken();
      const url = `${BASE}/output/download`;
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ note_id, title, content, format })
      }).then(res => res.blob());
    }),

  // NEW PREMIUM FEATURES
  
  // Flashcards
  generateFlashcards: (session_id, count = 10, difficulty = 'medium') =>
    request("/flashcards/generate", { 
      method: "POST", 
      body: JSON.stringify({ session_id, count, difficulty }) 
    }),
  getFlashcards: () => request("/flashcards"),
  getFlashcardsBySession: (session_id) => request(`/flashcards/session/${session_id}`),
  reviewFlashcard: (id, card_index, confidence) =>
    request(`/flashcards/${id}/review/${card_index}`, { 
      method: "PATCH", 
      body: JSON.stringify({ confidence }) 
    }),
  deleteFlashcardDeck: (id) => request(`/flashcards/${id}`, { method: "DELETE" }),

  // Analytics
  getQuizAnalytics: () => request("/analytics/quiz"),
  getStudyOverview: () => request("/analytics/overview"),
  getPerformanceComparison: () => request("/analytics/compare"),

  // Bookmarks
  createBookmark: (item_type, item_id, session_id, title, description = "", tags = [], folder = "General") =>
    request("/bookmarks", { 
      method: "POST", 
      body: JSON.stringify({ item_type, item_id, session_id, title, description, tags, folder }) 
    }),
  getBookmarks: (type = null, folder = null, tag = null) => {
    let url = "/bookmarks?";
    if (type) url += `type=${type}&`;
    if (folder) url += `folder=${folder}&`;
    if (tag) url += `tag=${tag}&`;
    return request(url);
  },
  getBookmarkFolders: () => request("/bookmarks/folders"),
  updateBookmark: (id, data) =>
    request(`/bookmarks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteBookmark: (id) => request(`/bookmarks/${id}`, { method: "DELETE" }),

  // Study Sessions
  startStudySession: (session_type = 'study', document_id = null, notes = null) =>
    request("/study-sessions/start", { 
      method: "POST", 
      body: JSON.stringify({ session_type, document_id, notes }) 
    }),
  endStudySession: (id, productivity_rating = null, notes = null) =>
    request(`/study-sessions/${id}/end`, { 
      method: "PATCH", 
      body: JSON.stringify({ productivity_rating, notes }) 
    }),
  addBreak: (id) =>
    request(`/study-sessions/${id}/break`, { method: "PATCH" }),
  logActivity: (id, type, duration_seconds) =>
    request(`/study-sessions/${id}/activity`, { 
      method: "PATCH", 
      body: JSON.stringify({ type, duration_seconds }) 
    }),
  getStudyStats: (period = 7) => request(`/study-sessions/stats?period=${period}`),
  getActiveStudySession: () => request("/study-sessions/active"),

  // Summary
  generateSummary: (session_id, type = 'tldr', max_length = 500) =>
    request("/summary/generate", { 
      method: "POST", 
      body: JSON.stringify({ session_id, type, max_length }) 
    }),
  compareDocuments: (session_id_1, session_id_2) =>
    request("/summary/compare", { 
      method: "POST", 
      body: JSON.stringify({ session_id_1, session_id_2 }) 
    }),

  // Export
  exportNoteAsMarkdown: (id) => {
    const token = getToken();
    window.open(`${BASE}/export/note/${id}/markdown?token=${token}`, '_blank');
  },
  exportNoteAsTxt: (id) => {
    const token = getToken();
    window.open(`${BASE}/export/note/${id}/txt?token=${token}`, '_blank');
  },
  exportFlashcardsAsCsv: (id) => {
    const token = getToken();
    window.open(`${BASE}/export/flashcards/${id}/csv?token=${token}`, '_blank');
  },
  exportFlashcardsAsAnki: (id) => {
    const token = getToken();
    window.open(`${BASE}/export/flashcards/${id}/anki?token=${token}`, '_blank');
  },
  exportAllNotes: () => request("/export/notes/all"),

  // Search
  search: (query, type = null, limit = 20) => {
    let url = `/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    return request(url);
  },
  getSearchSuggestions: (query) => 
    request(`/search/suggestions?q=${encodeURIComponent(query)}`),

  // AI Tutor
  teachTopic: (session_id, topic, depth = 'moderate') =>
    request("/tutor/teach", { 
      method: "POST", 
      body: JSON.stringify({ session_id, topic, depth }) 
    }),
  quizMe: (session_id, topic = null) =>
    request("/tutor/quiz-me", { 
      method: "POST", 
      body: JSON.stringify({ session_id, topic }) 
    }),
  explainELI5: (session_id, concept) =>
    request("/tutor/eli5", { 
      method: "POST", 
      body: JSON.stringify({ session_id, concept }) 
    }),
  generatePracticeProblems: (session_id, topic, difficulty = 'medium', count = 5) =>
    request("/tutor/practice", { 
      method: "POST", 
      body: JSON.stringify({ session_id, topic, difficulty, count }) 
    }),
  getStudyRecommendations: (session_id) =>
    request("/tutor/recommend", { 
      method: "POST", 
      body: JSON.stringify({ session_id }) 
    }),

  // Tags
  addTagsToSession: (session_id, tags, category = null) =>
    request(`/tags/session/${session_id}`, { 
      method: "PATCH", 
      body: JSON.stringify({ tags, category }) 
    }),
  getAllTags: () => request("/tags/list"),
  getSessionsByTag: (tag) => request(`/tags/${tag}`),

  // Share
  shareSession: (session_id, email, permission = 'view') =>
    request(`/share/session/${session_id}`, { 
      method: "POST", 
      body: JSON.stringify({ email, permission }) 
    }),
  getSharedSessions: () => request("/share/shared-with-me"),
  revokeAccess: (session_id, email) =>
    request(`/share/session/${session_id}/user/${email}`, { method: "DELETE" }),
};

export default api;
