"use client"
import { cn, formatNumber } from '../lib/utils'

export default function MetricCard({ icon, value, label, hindiLabel, trend, color='green', onClick }){
  const colorConfigs = {
    green: {
      border: 'border-green-500',
      text: 'text-green-600',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    yellow: {
      border: 'border-yellow-500',
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    red: {
      border: 'border-red-500',
      text: 'text-red-600',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    blue: {
      border: 'border-blue-500',
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    indigo: {
      border: 'border-indigo-500',
      text: 'text-indigo-600',
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    purple: {
      border: 'border-purple-500',
      text: 'text-purple-600',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    pink: {
      border: 'border-pink-500',
      text: 'text-pink-600',
      bg: 'bg-pink-50',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    },
    emerald: {
      border: 'border-emerald-500',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    orange: {
      border: 'border-orange-500',
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  }

  const config = colorConfigs[color] || colorConfigs.green

  return (
    <div 
      onClick={onClick} 
      className={cn(
        "rounded-xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-shadow cursor-pointer",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-full", config.iconBg)}>
          {icon}
        </div>
        <div className="text-right">
          {trend?.pct != null && (
            <span className={cn("text-sm font-semibold", config.text)}>
              {trend.pct > 0 ? '↑' : '↓'} {Math.abs(trend.pct).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div className={cn("text-4xl font-bold mb-2", config.text)}>
        {formatNumber(value)}
      </div>
      <div className="text-gray-700 text-sm">{label}</div>
      {hindiLabel && <div className="text-gray-600 text-xs mt-1">{hindiLabel}</div>}
    </div>
  )
}
