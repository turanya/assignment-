"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStates, searchDistricts } from '../lib/api'
import { t } from '../lib/i18n'
import { useLocale } from '../store/useLocale'
import { Button } from './ui/button'

export default function DistrictSelector(){
  const router = useRouter()
  const { lang } = useLocale()
  const [states, setStates] = useState([])
  const [state, setState] = useState('')
  const [districts, setDistricts] = useState([])
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    let c=false
    async function loadStates(){
      const data = await getStates().catch(()=>[])
      if(!c){ setStates(data); if(data.includes('ODISHA')) setState('ODISHA'); else setState(data[0]||'') }
    }
    loadStates()
    return ()=>{c=true}
  },[])

  useEffect(()=>{
    let c=false
    async function loadDistricts(){
      if(!state) { setDistricts([]); return }
      setLoading(true)
      const data = await searchDistricts(state).catch(()=>[])
      if(!c){ setDistricts(data); setLoading(false) }
    }
    loadDistricts()
    return ()=>{c=true}
  },[state])

  const selected = useMemo(()=> districts.find(d=> d.district_code===code) || null, [districts, code])

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="mb-3 font-bold">{t('location.selectPrompt', lang)}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={state} onChange={e=> { setState(e.target.value); setCode('') }} className="border rounded-lg p-2">
          <option value="" disabled>{t('state', lang)}</option>
          {states.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={code} onChange={e=> setCode(e.target.value)} className="border rounded-lg p-2">
          <option value="" disabled>{loading? t('loading', lang) : t('selectDistrict', lang)}</option>
          {districts.map(d=> <option key={d.district_code} value={d.district_code}>{d.district_name}</option>)}
        </select>
        <Button disabled={!code} onClick={()=> router.push(`/dashboard/${code}`)}>{t('viewDashboard', lang)}</Button>
      </div>
      {selected && <div className="text-xs text-gray-500 mt-2">{selected.state_name}</div>}
    </div>
  )
}
