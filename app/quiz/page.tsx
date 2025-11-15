'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import Timer from '@/components/timer';
import QuestionCard from '@/components/question-card';
import FrostCard from '@/components/frost-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { participantAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Question {
  id: string;
  title: string;
  options: string[];
  points: number;
}

interface QuizState {
  currentQuestion: number;
  answers: { questionId: string; answer: number }[];
  score: number;
  submitted: boolean;
}

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<QuizState>({
    currentQuestion: 0,
    answers: [],
    score: 0,
    submitted: false,
  });
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const name = localStorage.getItem('participantName');
    const email = localStorage.getItem('participantEmail');
    if (!name || !email) {
      router.push('/start');
      return;
    }
    setParticipantName(name);
    setParticipantEmail(email);
    loadQuestions();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await participantAPI.getQuestions();
      setQuestions(data.questions);
      setQuiz((prev) => ({
        ...prev,
        answers: data.questions.map((q) => ({
          questionId: q.id,
          answer: -1, // -1 means not answered
        })),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load questions';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">Loading quiz...</div>
            <div className="text-foreground/60">Please wait</div>
          </div>
        </main>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">No questions available</div>
            <div className="text-foreground/60">Please check back later</div>
          </div>
        </main>
      </>
    );
  }

  const currentQ = questions[quiz.currentQuestion];
  const currentAnswer = quiz.answers[quiz.currentQuestion]?.answer;

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...quiz.answers];
    newAnswers[quiz.currentQuestion] = {
      questionId: currentQ.id,
      answer: optionIndex,
    };
    setQuiz({ ...quiz, answers: newAnswers });
  };

  const handleNext = () => {
    if (quiz.currentQuestion < questions.length - 1) {
      setQuiz({ ...quiz, currentQuestion: quiz.currentQuestion + 1 });
    }
  };

  const handlePrevious = () => {
    if (quiz.currentQuestion > 0) {
      setQuiz({ ...quiz, currentQuestion: quiz.currentQuestion - 1 });
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit your answers? This action cannot be undone.')) {
      return;
    }

    setSubmitting(true);
    try {
      // Filter out unanswered questions
      const answeredQuestions = quiz.answers.filter((a) => a.answer !== -1);

      if (answeredQuestions.length === 0) {
        toast.error('Please answer at least one question before submitting');
        setSubmitting(false);
        return;
      }

      const result = await participantAPI.submit(
        participantName,
        participantEmail,
        answeredQuestions
      );

      localStorage.setItem('quizScore', result.participant.score.toString());
      localStorage.setItem('quizSubmitted', 'true');
      toast.success('Quiz submitted successfully!');
      router.push('/thank-you');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto px-4"
        >
          {/* Header with progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold">Quiz</h1>
                <p className="text-foreground/80">
                  Question {quiz.currentQuestion + 1} of {questions.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-foreground/60 mb-2">Time: {formatTime(timeElapsed)}</div>
                <Timer duration={600} />
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                animate={{
                  width: `${((quiz.currentQuestion + 1) / questions.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={quiz.currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-center mb-8"
          >
            <QuestionCard
              question={currentQ.title}
              options={currentQ.options}
              selectedOption={currentAnswer !== -1 ? currentQ.options[currentAnswer] : null}
              onSelect={(option) => {
                const index = currentQ.options.indexOf(option);
                if (index !== -1) {
                  handleSelectOption(index);
                }
              }}
            />
          </motion.div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              disabled={quiz.currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-primary transition-all disabled:opacity-50"
            >
              <ChevronLeft size={20} />
              Previous
            </motion.button>

            {quiz.currentQuestion === questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-foreground font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-primary transition-all"
              >
                Next
                <ChevronRight size={20} />
              </motion.button>
            )}
          </div>

          {/* Question indicator dots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-2 mt-12"
          >
            {questions.map((_, index) => {
              const answer = quiz.answers[index]?.answer;
              return (
                <motion.button
                  key={index}
                  onClick={() => setQuiz({ ...quiz, currentQuestion: index })}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === quiz.currentQuestion
                      ? 'bg-primary w-8'
                      : answer !== undefined && answer !== -1
                      ? 'bg-secondary'
                      : 'bg-border'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              );
            })}
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
