'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import FrostCard from '@/components/frost-card';
import { participantAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function StartPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await participantAPI.start(name, email);
      localStorage.setItem('participantName', name);
      localStorage.setItem('participantEmail', email);
      if (res && (res as any).startedAt) {
        localStorage.setItem('quizStartedAt', (res as any).startedAt);
      } else {
        localStorage.setItem('quizStartedAt', new Date().toISOString());
      }
      toast.success('Registration successful!');
      router.push('/quiz');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-4"
        >
          <FrostCard className="border-2 border-primary/30">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Join the Challenge</h1>
              <p className="text-foreground/80">
                Enter your details to begin the FrostByte quiz
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-foreground font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start Quiz'}
              </motion.button>

              <div className="text-center text-sm text-foreground/80">
                <Link href="/" className="text-primary hover:underline">
                  Back to Home
                </Link>
              </div>
            </form>
          </FrostCard>
        </motion.div>
      </main>
    </>
  );
}
