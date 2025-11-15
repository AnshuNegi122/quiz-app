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
    // Clear cookie by setting it to expire
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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

  createQuestion: async (question: {
    title: string;
    options: string[];
    correctOption: number;
    points?: number;
  }) => {
    const response = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(question),
    });
    return handleResponse<{
      success: boolean;
      question: {
        id: string;
        title: string;
        options: string[];
        correctOption: number;
        points: number;
        createdAt: string;
      };
    }>(response);
  },

  updateQuestion: async (
    id: string,
    question: {
      title: string;
      options: string[];
      correctOption: number;
      points?: number;
    }
  ) => {
    const response = await fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(question),
    });
    return handleResponse<{
      success: boolean;
      question: {
        id: string;
        title: string;
        options: string[];
        correctOption: number;
        points: number;
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
      }>;
    }>(response);
  },

  submit: async (name: string, email: string, answers: Array<{ questionId: string; answer: number }>) => {
    const response = await fetch('/api/participant/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, answers }),
    });
    return handleResponse<{
      success: boolean;
      participant: {
        id: string;
        name: string;
        score: number;
        submittedAt: string;
      };
    }>(response);
  },
};

