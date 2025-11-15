'use client';

import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time: string;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
}

export default function LeaderboardTable({ data }: LeaderboardTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-primary font-semibold">Rank</th>
            <th className="px-4 py-3 text-left text-primary font-semibold">Participant</th>
            <th className="px-4 py-3 text-left text-primary font-semibold">Score</th>
            <th className="px-4 py-3 text-left text-primary font-semibold">Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-border hover:bg-surface/50 transition-colors"
            >
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-foreground font-bold text-sm">
                  {entry.rank}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold">{entry.name}</td>
              <td className="px-4 py-3">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary font-bold">
                  {entry.score}
                </span>
              </td>
              <td className="px-4 py-3 text-foreground/80">{entry.time}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
