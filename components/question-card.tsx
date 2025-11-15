'use client';

import { motion } from 'framer-motion';
import FrostCard from './frost-card';

interface QuestionCardProps {
  question: string;
  options: string[];
  imageUrl?: string | null;
  selectedOption: string | null;
  onSelect: (option: string) => void;
}

export default function QuestionCard({
  question,
  options,
  imageUrl,
  selectedOption,
  onSelect,
}: QuestionCardProps) {
  return (
    <FrostCard className="w-full max-w-2xl">
      {imageUrl && (
        <div className="mb-6">
          <img
            src={imageUrl}
            alt="Question illustration"
            className="w-full h-auto max-h-96 object-contain rounded-lg border border-border"
          />
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
