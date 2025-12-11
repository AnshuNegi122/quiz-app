'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import FrostCard from '@/components/frost-card';
import { Snowflake, Zap, Trophy } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 py-20"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-6"
            >
              <Snowflake className="w-16 h-16 text-primary" />
            </motion.div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ACM Technical Round
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-8">
              Test your knowledge in an icy realm of tech challenges. Compete, learn, and conquer the techinal round!
            </p>
            <Link
              href="/start"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-secondary text-foreground font-bold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all hover:scale-105"
            >
              Start Quiz
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-6 mb-20"
          >
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                desc: 'Quick questions to test your knowledge in real time',
              },
              {
                icon: Trophy,
                title: 'Compete & Win',
                desc: 'Climb the leaderboard and prove your expertise',
              },
              {
                icon: Snowflake,
                title: 'Chill Vibes',
                desc: 'Beautiful frost-themed design with smooth interactions',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <FrostCard key={i} hover>
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-foreground/80">{feature.desc}</p>
                </FrostCard>
              );
            })}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-4 gap-4 text-center"
          >
            {[
              { label: 'Questions', value: '50+' },
              { label: 'Participants', value: '1000+' },
              { label: 'High Score', value: '980' },
              { label: 'Avg Time', value: '8m 32s' },
            ].map((stat, i) => (
              <FrostCard key={i}>
                <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-foreground/80">{stat.label}</p>
              </FrostCard>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
