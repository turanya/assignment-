import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs){ return twMerge(clsx(inputs)) }
export function formatNumber(n){ if(n==null) return '—'; const f=Intl.NumberFormat('en-IN'); return f.format(n) }
export function relativeTime(date){ if(!date) return ''; const d=new Date(date); const diff=Date.now()-d.getTime(); const h=Math.floor(diff/3600000); if(h<1){const m=Math.floor(diff/60000); return `${m} min ago`} return `${h} hours ago` }
