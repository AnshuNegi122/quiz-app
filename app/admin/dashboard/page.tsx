'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin-sidebar';
import FrostCard from '@/components/frost-card';
import LeaderboardTable from '@/components/leaderboard-table';
import { BarChart3, Users, Trophy, TrendingUp } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';

const STATS = [
  {
    icon: BarChart3,
    label: 'Total Questions',
    value: '0',
    color: 'from-primary to-secondary',
  },
  {
    icon: Users,
    label: 'Total Participants',
    value: '0',
    color: 'from-secondary to-accent',
  },
  {
    icon: Trophy,
    label: 'Highest Score',
    value: '0%',
    color: 'from-accent to-primary',
  },
  {
    icon: TrendingUp,
    label: 'Avg Score',
    value: '0%',
    color: 'from-primary to-accent',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(STATS);
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number; name: string; score: number; time: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, leaderboardData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getLeaderboard(1, 5),
      ]);

      setStats([
        {
          icon: BarChart3,
          label: 'Total Questions',
          value: statsData.totalQuestions.toString(),
          color: 'from-primary to-secondary',
        },
        {
          icon: Users,
          label: 'Total Participants',
          value: statsData.totalParticipants.toString(),
          color: 'from-secondary to-accent',
        },
        {
          icon: Trophy,
          label: 'Highest Score',
          value: `${statsData.topScore}%`,
          color: 'from-accent to-primary',
        },
        {
          icon: TrendingUp,
          label: 'Avg Score',
          value: `${statsData.avgScore}%`,
          color: 'from-primary to-accent',
        },
      ]);

      setLeaderboard(leaderboardData.leaderboard);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      toast.error(errorMessage);
      if (errorMessage.includes('Unauthorized')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-8"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-foreground/80">
              Overview of quiz statistics and participant performance
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} variants={itemVariants}>
                  <FrostCard hover>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-foreground/80 text-sm mb-2">
                          {stat.label}
                        </p>
                        <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {loading ? '...' : stat.value}
                        </p>
                      </div>
                      <Icon className="w-12 h-12 text-foreground/40" />
                    </div>
                  </FrostCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Leaderboard Preview */}
          <motion.div variants={itemVariants}>
            <FrostCard>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Top Performers</h2>
                <p className="text-foreground/80 text-sm">
                  Current leaderboard rankings
                </p>
              </div>
              {loading ? (
                <div className="text-center py-8 text-foreground/60">Loading...</div>
              ) : leaderboard.length > 0 ? (
                <LeaderboardTable data={leaderboard} />
              ) : (
                <div className="text-center py-8 text-foreground/60">No participants yet</div>
              )}
            </FrostCard>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
