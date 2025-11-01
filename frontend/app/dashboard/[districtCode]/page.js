"use client"
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Users, CalendarCheck2, IndianRupee, Building2 } from 'lucide-react'
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend, 
  RadialBarChart, 
  RadialBar, 
  PolarAngleAxis 
} from 'recharts'
import MetricCard from '../../../components/MetricCard'
import { LineTrend, BarCompare } from '../../../components/TrendChart'
import PerformanceGauge from '../../../components/PerformanceGauge'
import ComparisonTable from '../../../components/ComparisonTable'
import { getCurrent, getHistory, getCompare } from '../../../lib/api'
import { formatNumber } from '../../../lib/utils'
import { useLocale } from '../../../store/useLocale'
import { t, relativeTimeLocalized } from '../../../lib/i18n'

export default function DashboardPage(){
  const params = useParams()
  const router = useRouter()
  const code = params?.districtCode
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])
  const [compare, setCompare] = useState(null)
  const { lang } = useLocale()

  useEffect(()=>{
    let c=false
    async function load(){
      const [a,b,cx] = await Promise.all([
        getCurrent(code).catch(()=>null),
        getHistory(code).catch(()=>({history:[]})),
        getCompare(code).catch(()=>null)
      ])
      if(!c){ setCurrent(a); setHistory(b?.history||[]); setCompare(cx) }
    }
    if(code) load()
    return ()=>{c=true}
  },[code])

  const monthLabel = (h)=> h.map(it=> it.month || it.label || '')
  const lineData = useMemo(()=> history.map(h=> ({ label: `${h.month}-${h.fin_year}`, value: Number(h.total_households_worked||0) })), [history])
  const barData = useMemo(()=> history.map(h=> ({ label: `${h.month}-${h.fin_year}`, value: Number(h.total_expenditure||0) })), [history])

  if(!current) return <main className="max-w-6xl mx-auto p-4">{t('loading', lang)}</main>

  const latest = current.latest
  const lastUpdated = latest?.last_updated || latest?.updatedAt
  const completionRate = latest && (Number(latest.completed_works||0) / (Number(latest.completed_works||0)+Number(latest.ongoing_works||0) || 1))*100
  const stateCompare = compare?.state_compare

  const colorFor = (key)=> {
    if (!stateCompare || stateCompare[key]==null) return 'yellow'
    return stateCompare[key] >= 0 ? 'green' : 'red'
  }

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 bg-rose-50">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-3xl font-extrabold">{latest.district_name}</div>
          <div className="text-gray-600 text-sm">{t('lastUpdated', lang)}: {relativeTimeLocalized(lastUpdated, lang)}</div>
        </div>
        <button onClick={()=> router.push('/')} className="px-4 py-2 rounded-lg bg-gray-100">{t('changeDistrict', lang)}</button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={<Users className="w-8 h-8 text-blue-600"/>} 
          value={latest.total_households_worked} 
          label={t('metrics.totalFamilies', lang)} 
          trend={current.comparisons.total_households_worked} 
          color="blue" 
        />
        <MetricCard 
          icon={<CalendarCheck2 className="w-8 h-8 text-indigo-600"/>} 
          value={latest.average_days_employment} 
          label={t('metrics.avgDays', lang)} 
          trend={current.comparisons.average_days_employment} 
          color="indigo" 
        />
        <MetricCard 
          icon={<IndianRupee className="w-8 h-8 text-emerald-600"/>} 
          value={latest.total_expenditure} 
          label={t('metrics.totalSpent', lang)} 
          trend={current.comparisons.total_expenditure} 
          color="emerald" 
        />
        <MetricCard 
          icon={<Building2 className="w-8 h-8 text-orange-600"/>} 
          value={latest.completed_works} 
          label={t('metrics.completedWorks', lang)} 
          trend={current.comparisons.completed_works} 
          color="orange" 
        />
      </section>

      {/* Last 12 Months & Monthly Expenditure */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-xl shadow p-4 border-l-4 border-indigo-500">
          <div className="font-bold text-indigo-700 mb-2">{t('charts.last12Months', lang)}</div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#c7d2fe" />
                <XAxis dataKey="label" stroke="#4f46e5" />
                <YAxis stroke="#4f46e5" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-xl shadow p-4 border-l-4 border-emerald-500">
          <div className="font-bold text-emerald-700 mb-2">{t('charts.monthlyExpenditure', lang)}</div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a7f3d0" />
                <XAxis dataKey="label" stroke="#10b981" />
                <YAxis stroke="#10b981" />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="value" 
                  fill="#10b981" 
                  radius={[6,6,0,0]} 
                  name="Expenditure (₹)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Work Completion Rate & Comparison Table */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-amber-50 rounded-xl shadow p-6 border-l-4 border-amber-500">
          <div className="font-bold text-amber-700 mb-2">{t('gauge.workCompletionRate', lang)}</div>
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  data={[{ name: 'v', value: isFinite(completionRate) ? completionRate : 0 }]} 
                  startAngle={180} 
                  endAngle={0} 
                  innerRadius="70%" 
                  outerRadius="100%"
                >
                  <PolarAngleAxis type="number" domain={[0,100]} angleAxisId={0} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={10} fill="#f59e0b" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-bold text-amber-700">
                  {isFinite(completionRate) ? Math.round(completionRate) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl shadow p-4 border-l-4 border-purple-500">
          <div className="font-bold text-purple-700 mb-2">{t('compare.title', lang)}</div>
          <div className="max-h-[280px] overflow-y-auto">
            <ComparisonTable 
              top={compare?.top_districts||[]} 
              peers={compare?.peer_compare||[]} 
              highlightCode={code} 
            />
          </div>
        </div>
      </section>

      {/* View More Information */}
      <section>
        <details className="bg-rose-50 rounded-xl shadow overflow-hidden border-l-4 border-rose-500">
          <summary className="font-bold cursor-pointer p-4 text-rose-700 hover:bg-rose-100 transition-colors">
            {t('details.viewMore', lang)}
          </summary>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-rose-100">
              <div className="text-rose-600 font-medium">{t('details.scPersondays', lang)}</div>
              <div className="text-lg font-semibold text-rose-800">{formatNumber(latest.sc_persondays)}</div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-rose-100">
              <div className="text-rose-600 font-medium">{t('details.stPersondays', lang)}</div>
              <div className="text-lg font-semibold text-rose-800">{formatNumber(latest.st_persondays)}</div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-rose-100">
              <div className="text-rose-600 font-medium">{t('details.womenPersondays', lang)}</div>
              <div className="text-lg font-semibold text-rose-800">{formatNumber(latest.women_persondays)}</div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-rose-100">
              <div className="text-rose-600 font-medium">{t('details.hh100Days', lang)}</div>
              <div className="text-lg font-semibold text-rose-800">{formatNumber(latest.households_completed_100_days)}</div>
            </div>
          </div>
        </details>
      </section>
    </main>
  )
}
