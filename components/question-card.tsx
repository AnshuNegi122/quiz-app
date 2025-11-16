'use client';

import { motion } from 'framer-motion';
import FrostCard from './frost-card';

interface QuestionCardProps {
  question: string;
  options: string[];
  code?: string | null;
  selectedOption: string | null;
  onSelect: (option: string) => void;
}

export default function QuestionCard({
  question,
  options,
  code,
  selectedOption,
  onSelect,
}: QuestionCardProps) {
  return (
    <FrostCard className="w-full max-w-2xl">
      {code && (
        <div className="mb-6">
          <pre className="w-full max-h-96 overflow-auto rounded-lg border border-border bg-surface/50 p-4 text-sm text-foreground">
            <code>{code}</code>
          </pre>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-8 text-foreground">{question}</h2>
      
      <div className="space-y-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(option)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left font-semibold ${
              selectedOption === option
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-border bg-surface/50 text-foreground hover:border-primary/50'
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </FrostCard>
  );
}
