'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  glowColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  glowColor = 'indigo',
}) => {
  const glowStyles: Record<string, string> = {
    indigo: 'rgba(99, 102, 241, 0.15)',
    purple: 'rgba(139, 92, 246, 0.15)',
    emerald: 'rgba(16, 185, 129, 0.15)',
    blue: 'rgba(59, 130, 246, 0.15)',
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md p-5 flex flex-col gap-2 transition-all duration-300"
      style={{
        boxShadow: `0 8px 30px -8px ${glowStyles[glowColor] || 'transparent'}`,
      }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-white/[0.02] to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {title}
        </span>
        <div className={`p-2 rounded-xl bg-${glowColor}-500/10 text-indigo-400 border border-white/[0.02]`}>
          <Icon size={16} className={`text-${glowColor}-400`} />
        </div>
      </div>

      <div className="flex flex-col mt-1">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {description && <span className="text-[10px] text-zinc-500 mt-1">{description}</span>}
      </div>
    </motion.div>
  );
};

export default StatCard;
