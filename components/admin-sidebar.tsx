'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, HelpCircle, Users, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/questions', label: 'Questions', icon: HelpCircle },
    { href: '/admin/leaderboard', label: 'Leaderboard', icon: Users },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-64 border-r border-border bg-surface/50 backdrop-blur-sm p-6 min-h-screen"
    >
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-foreground font-bold">FB</span>
        </div>
        <span className="font-bold text-lg">FrostByte</span>
      </Link>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/50'
                  : 'text-foreground/80 hover:text-primary'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-12 pt-6 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-accent transition-colors w-full">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
