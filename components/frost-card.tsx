'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FrostCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function FrostCard({ children, className = '', hover = false }: FrostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { translateY: -4, transition: { duration: 0.2 } } : {}}
      className={`
        rounded-xl p-6 border border-border
        bg-gradient-to-br from-surface via-surface to-background
        backdrop-blur-md
        shadow-lg shadow-primary/10
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
