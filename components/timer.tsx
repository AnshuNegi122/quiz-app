'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  duration: number;
  onExpire?: () => void;
}

export default function Timer({ duration, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
      isWarning 
        ? 'bg-red-500/10 border-red-500/50' 
        : 'bg-primary/10 border-primary/50'
    }`}>
      <Clock size={18} className={isWarning ? 'text-red-400' : 'text-primary'} />
      <span className={`font-mono font-bold ${isWarning ? 'text-red-400' : 'text-primary'}`}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
