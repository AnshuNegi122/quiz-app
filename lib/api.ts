// API utility functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || 'An error occurred');
  }
  return response.json();
}

// Admin API calls
export const adminAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<{ success: boolean; admin: { id: string; username: string } }>(response);
  },

  logout: async () => {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  getStats: async () => {
    const response = await fetch('/api/admin/stats', {
      credentials: 'include',
    });
    return handleResponse<{
      totalQuestions: number;
      totalParticipants: number;
      topScore: number;
      avgScore: number;
    }>(response);
  },

  getLeaderboard: async (page: number = 1, limit: number = 10) => {
    const response = await fetch(
      `/api/admin/leaderboard?page=${page}&limit=${limit}`,
      {
        credentials: 'include',
      }
    );
    return handleResponse<{
      leaderboard: Array<{
        rank: number;
        name: string;
        email: string;
        score: number;
        time: string;
        submittedAt: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(response);
  },

  getQuestions: async () => {
    const response = await fetch('/api/admin/questions', {
      credentials: 'include',
    });
    return handleResponse<{
      questions: Array<{
        id: string;
        title: string;
        options: string[];
        correctOption: number;
        points: number;
        createdAt: string;
      }>;
    }>(response);
  },

  createQuestion: async (formData: FormData) => {
    const response = await fetch('/api/admin/questions', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return handleResponse<{
      success: boolean;
      question: {
        id: string;
        title: string;
        options: string[];
        correctOption: number;
        points: number;
        imageUrl?: string | null;
        createdAt: string;
      };
    }>(response);
  },

  updateQuestion: async (id: string, formData: FormData) => {
    const response = await fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    return handleResponse<{
      success: boolean;
      question: {
        id: string;
        title: string;
        options: string[];
        correctOption: number;
        points: number;
        imageUrl?: string | null;
        createdAt: string;
      };
    }>(response);
  },

  deleteQuestion: async (id: string) => {
    const response = await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },
};

// Participant API calls
export const participantAPI = {
  start: async (name: string, email: string) => {
    const response = await fetch('/api/participant/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  getQuestions: async () => {
    const response = await fetch('/api/questions');
    return handleResponse<{
      questions: Array<{
        id: string;
        title: string;
        options: string[];
        points: number;
        imageUrl?: string | null;
      }>;
    }>(response);
  },

  status: async (email: string) => {
    const response = await fetch(`/api/participant/status?email=${encodeURIComponent(email)}`);
    return handleResponse<{ hasTaken: boolean }>(response);
  },

  submit: async (name: string, email: string, answers: Array<{ questionId: string; answer: number }>) => {
    const startedAt = localStorage.getItem('quizStartedAt');
    const response = await fetch('/api/participant/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, answers, startedAt }),
    });
    return handleResponse<{
      success: boolean;
      participant: {
        id: string;
        name: string;
        score: number;
        correctCount?: number;
        totalQuestions?: number;
        submittedAt: string;
      };
    }>(response);
  },
};

