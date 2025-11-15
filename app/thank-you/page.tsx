'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import FrostCard from '@/components/frost-card';
import { Trophy, Share2, Home } from 'lucide-react';

export default function ThankYouPage() {
  const [score, setScore] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    const savedScore = localStorage.getItem('quizScore');
    const savedCorrectCount = localStorage.getItem('quizCorrectCount');
    const savedTotalQuestions = localStorage.getItem('quizTotalQuestions');
    const savedName = localStorage.getItem('participantName');
    
    setScore(savedScore ? parseInt(savedScore) : null);
    setCorrectCount(savedCorrectCount ? parseInt(savedCorrectCount) : null);
    setTotalQuestions(savedTotalQuestions ? parseInt(savedTotalQuestions) : null);
    setName(savedName || 'Participant');
  }, []);

  const getMessage = () => {
    if (score === null) return 'Thank you for participating!';
    if (score >= 80) return 'Excellent Performance!';
    if (score >= 60) return 'Great Job!';
    return 'Good Effort!';
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-4"
        >
          <FrostCard className="text-center border-2 border-primary/30">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6"
            >
              <Trophy className="w-20 h-20 mx-auto text-secondary" />
            </motion.div>

            <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-foreground/80 mb-8">{getMessage()}</p>

            <p className="text-foreground/80 mb-8">
              Thank you for taking the FrostByte challenge, {name}!
            </p>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-foreground font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
              >
                <Share2 size={20} />
                Share Results
              </motion.button>

              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-primary transition-all font-semibold"
              >
                <Home size={20} />
                Back to Home
              </Link>
            </div>
          </FrostCard>
        </motion.div>
      </main>
    </>
  );
}
