'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-surface/50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-foreground font-bold text-sm">FB</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FrostByte
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/start" className="text-foreground/80 hover:text-primary transition-colors">
              Quiz
            </Link>
            <Link href="/admin/login" className="text-foreground/80 hover:text-primary transition-colors">
              Admin
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block text-foreground/80 hover:text-primary transition-colors py-2">
              Home
            </Link>
            <Link href="/start" className="block text-foreground/80 hover:text-primary transition-colors py-2">
              Quiz
            </Link>
            <Link href="/admin/login" className="block text-foreground/80 hover:text-primary transition-colors py-2">
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
