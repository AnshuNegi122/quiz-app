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
  imageUrl?: string | null;
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
    const hasSubmitted = localStorage.getItem('quizSubmitted');
    const submittedEmail = localStorage.getItem('quizSubmittedEmail');
    const submittedAt = localStorage.getItem('quizSubmittedAt');
    
    if (!name || !email) {
      router.push('/start');
      return;
    }
    
    // Verify with backend whether this email has already taken the quiz
    const checkStatus = async () => {
      try {
        if (
          hasSubmitted === 'true' &&
          submittedEmail === email &&
          submittedAt
        ) {
          // Fast-path if same email already submitted in this browser
          router.push('/thank-you');
          return;
        }
        const status = await participantAPI.status(email);
        if (status.hasTaken) {
          // Persist flags so subsequent loads are fast
          localStorage.setItem('quizSubmitted', 'true');
          localStorage.setItem('quizSubmittedEmail', email);
          localStorage.setItem('quizSubmittedAt', Date.now().toString());
          router.push('/thank-you');
          return;
        }
      } catch (e) {
        // If status check fails, continue to load quiz for resilience
        console.warn('Status check failed, continuing to quiz');
      }
      setParticipantName(name);
      setParticipantEmail(email);
      loadQuestions();
    };

    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      
      // Defensive check: ensure questions array exists and is valid
      if (!data || !data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response from server');
      }
      
      // Filter out any invalid questions and ensure required fields exist
      const validQuestions = data.questions.filter((q: any) => 
        q && 
        q.id && 
        q.title && 
        Array.isArray(q.options) && 
        q.options.length > 0
      );
      
      if (validQuestions.length === 0) {
        throw new Error('No valid questions available');
      }
      
      setQuestions(validQuestions);
      setQuiz((prev) => ({
        ...prev,
        currentQuestion: 0, // Reset to first question
        answers: validQuestions.map((q: any) => ({
          questionId: q.id,
          answer: -1, // -1 means not answered
        })),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load questions';
      toast.error(errorMessage);
      console.error('Error loading questions:', error);
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

  if (questions.length === 0 && !loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">No questions available</div>
            <div className="text-foreground/60">Please check back later</div>
            <button
              onClick={() => router.push('/start')}
              className="mt-4 px-4 py-2 bg-primary text-foreground rounded-lg hover:opacity-80"
            >
              Go Back
            </button>
          </div>
        </main>
      </>
    );
  }

  // Defensive check: ensure current question exists
  if (!questions[quiz.currentQuestion]) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">Error loading question</div>
            <div className="text-foreground/60">Please refresh the page</div>
          </div>
        </main>
      </>
    );
  }

  const currentQ = questions[quiz.currentQuestion];
  const currentAnswer = quiz.answers[quiz.currentQuestion]?.answer ?? -1;

  const handleSelectOption = (optionIndex: number) => {
    setQuiz((prev) => {
      const newAnswers = [...prev.answers];
      const currentQuestion = questions[prev.currentQuestion];
      const currentQuestionId = currentQuestion?.id;
      if (currentQuestionId && optionIndex >= 0 && optionIndex < (currentQuestion?.options?.length || 0)) {
        newAnswers[prev.currentQuestion] = {
          questionId: currentQuestionId,
          answer: optionIndex,
        };
      }
      return { ...prev, answers: newAnswers };
    });
  };

  const handleNext = () => {
    setQuiz((prev) => {
      if (prev.currentQuestion < questions.length - 1) {
        return { ...prev, currentQuestion: prev.currentQuestion + 1 };
      }
      return prev;
    });
  };

  const handlePrevious = () => {
    setQuiz((prev) => {
      if (prev.currentQuestion > 0) {
        return { ...prev, currentQuestion: prev.currentQuestion - 1 };
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return; // Prevent double submission
    
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
      if (result.participant.correctCount !== undefined && result.participant.totalQuestions !== undefined) {
        localStorage.setItem('quizCorrectCount', result.participant.correctCount.toString());
        localStorage.setItem('quizTotalQuestions', result.participant.totalQuestions.toString());
      }
      localStorage.setItem('quizSubmitted', 'true');
      localStorage.setItem('quizSubmittedEmail', participantEmail);
      localStorage.setItem('quizSubmittedAt', Date.now().toString());
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
                  Question {Math.min(quiz.currentQuestion + 1, questions.length)} of {questions.length}
                </p>
              </div>
              <div className="text-right">
                {/* <div className="text-sm text-foreground/60 mb-2">Time: {formatTime(timeElapsed)}</div> */}
                <Timer duration={600} />
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                animate={{
                  width: questions.length > 0 ? `${((quiz.currentQuestion + 1) / questions.length) * 100}%` : '0%',
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
              question={currentQ?.title || ''}
              options={Array.isArray(currentQ?.options) ? currentQ.options : []}
              imageUrl={currentQ?.imageUrl || null}
              selectedOption={currentAnswer !== -1 && currentAnswer !== undefined && currentQ?.options?.[currentAnswer] ? currentQ.options[currentAnswer] : null}
              onSelect={(option) => {
                if (!currentQ?.options) return;
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
