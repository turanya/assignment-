"use client"
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export default function PerformanceGauge({ value=0, label }){
  const data = [{ name:'v', value }]
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="font-bold mb-2">{label}</div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <RadialBarChart data={data} startAngle={180} endAngle={0} innerRadius="70%" outerRadius="100%">
            <PolarAngleAxis type="number" domain={[0,100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={10} fill="#2563eb" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center text-3xl font-bold">{Math.round(value)}%</div>
    </div>
  )
}
