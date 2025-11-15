'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '@/components/admin-sidebar';
import FrostCard from '@/components/frost-card';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Question {
  id: string;
  title: string;
  options: string[];
  correctOption: number;
  points: number;
}

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data?: Question }>({
    isOpen: false,
    mode: 'add',
  });
  const [formData, setFormData] = useState({
    title: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctOption: 0,
    points: 1,
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    loadQuestions();
  }, [router]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getQuestions();
      setQuestions(data.questions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load questions';
      toast.error(errorMessage);
      if (errorMessage.includes('Unauthorized')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      title: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctOption: 0,
      points: 1,
    });
    setModal({ isOpen: true, mode: 'add' });
  };

  const openEditModal = (q: Question) => {
    setFormData({
      title: q.title,
      option1: q.options[0],
      option2: q.options[1],
      option3: q.options[2],
      option4: q.options[3],
      correctOption: q.correctOption,
      points: q.points,
    });
    setModal({ isOpen: true, mode: 'edit', data: q });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const questionData = {
        title: formData.title,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        correctOption: formData.correctOption,
        points: formData.points,
      };

      if (modal.mode === 'add') {
        await adminAPI.createQuestion(questionData);
        toast.success('Question created successfully!');
      } else if (modal.data?.id) {
        await adminAPI.updateQuestion(modal.data.id, questionData);
        toast.success('Question updated successfully!');
      }

      setModal({ isOpen: false, mode: 'add' });
      loadQuestions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save question';
      toast.error(errorMessage);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await adminAPI.deleteQuestion(id);
      toast.success('Question deleted successfully!');
      loadQuestions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete question';
      toast.error(errorMessage);
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: 'add' });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-start mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Questions</h1>
              <p className="text-foreground/80">
                Manage quiz questions and answers
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-foreground font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
            >
              <Plus size={20} />
              Add Question
            </motion.button>
          </motion.div>

          {/* Questions List */}
          {loading ? (
            <div className="text-center py-8 text-foreground/60">Loading...</div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="space-y-4"
            >
              <AnimatePresence>
                {questions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <FrostCard>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-foreground/80 mb-2">Question {i + 1}</p>
                          <h3 className="text-lg font-bold mb-4">{q.title}</h3>
                          <div className="space-y-2">
                            {q.options.map((option, idx) => (
                              <p
                                key={idx}
                                className={`text-sm ${
                                  idx === q.correctOption
                                    ? 'text-primary font-bold'
                                    : 'text-foreground/80'
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}. {option}
                                {idx === q.correctOption && ' ✓'}
                              </p>
                            ))}
                          </div>
                          <p className="text-xs text-foreground/60 mt-2">Points: {q.points}</p>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(q)}
                            className="p-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
                          >
                            <Edit2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteQuestion(q.id)}
                            className="p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </FrostCard>
                  </motion.div>
                ))}
              </AnimatePresence>
              {questions.length === 0 && (
                <div className="text-center py-8 text-foreground/60">No questions yet. Add your first question!</div>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <FrostCard>
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">
                    {modal.mode === 'add' ? 'Add Question' : 'Edit Question'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-surface/50 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Question</label>
                    <textarea
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>

                  {['option1', 'option2', 'option3', 'option4'].map((opt, i) => (
                    <div key={opt}>
                      <label className="block text-sm font-semibold mb-2">
                        Option {i + 1}
                      </label>
                      <input
                        type="text"
                        value={formData[opt as keyof typeof formData] as string}
                        onChange={(e) =>
                          setFormData({ ...formData, [opt]: e.target.value })
                        }
                        required
                        placeholder={`Enter option ${i + 1}`}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Correct Option (0-3)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={formData.correctOption}
                      onChange={(e) =>
                        setFormData({ ...formData, correctOption: parseInt(e.target.value) })
                      }
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Points</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) =>
                        setFormData({ ...formData, points: parseInt(e.target.value) })
                      }
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="flex gap-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 rounded-lg border border-border hover:border-primary transition-colors font-semibold"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-foreground font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
                    >
                      {modal.mode === 'add' ? 'Add' : 'Update'}
                    </motion.button>
                  </div>
                </form>
              </FrostCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
