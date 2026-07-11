import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'brand' }) {
  const colorMap = {
    brand: {
      bg: 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border-brand-100 dark:border-brand-900/30',
      glow: 'shadow-brand-500/10'
    },
    violet: {
      bg: 'bg-violetAccent-50 dark:bg-violetAccent-950/20 text-violetAccent-600 dark:text-violetAccent-400 border-violetAccent-100 dark:border-violetAccent-900/30',
      glow: 'shadow-violetAccent-500/10'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
      glow: 'shadow-emerald-500/10'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
      glow: 'shadow-amber-500/10'
    }
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div className={`bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${scheme.glow} flex items-center justify-between`}>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <h4 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white">{value}</h4>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${scheme.bg} shadow-md`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </div>
  );
}
