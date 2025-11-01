"use client"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts'
import { useLocale } from '../store/useLocale'
import { t } from '../lib/i18n'

export function LineTrend({ data, lineKey='value', color='#2563eb' }){
  const { lang } = useLocale()
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="font-bold mb-2">{t('charts.last12Months', lang)}</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={lineKey} stroke={color} strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarCompare({ data, barKey='value', color='#10b981' }){
  const { lang } = useLocale()
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="font-bold mb-2">{t('charts.monthlyExpenditure', lang)}</div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={barKey} fill={color} radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
