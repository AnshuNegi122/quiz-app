'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin-sidebar';
import FrostCard from '@/components/frost-card';
import LeaderboardTable from '@/components/leaderboard-table';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time: string;
}

export default function AdminLeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    loadLeaderboard();
  }, [router, page]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getLeaderboard(page, 10);
      setLeaderboard(data.leaderboard);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load leaderboard';
      toast.error(errorMessage);
      if (errorMessage.includes('Unauthorized')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
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
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-foreground/80">
              View and sort participant rankings ({total} total participants)
            </p>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FrostCard>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Rankings</h2>
              </div>
              {loading ? (
                <div className="text-center py-8 text-foreground/60">Loading...</div>
              ) : leaderboard.length > 0 ? (
                <>
                  <LeaderboardTable data={leaderboard} />
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-border hover:border-primary transition-colors disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-foreground/80">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg border border-border hover:border-primary transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
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
