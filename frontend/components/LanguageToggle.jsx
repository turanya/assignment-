"use client"
import { useLocale } from '../store/useLocale'
import { Switch } from './ui/switch'

export default function LanguageToggle(){
  const { lang, toggle } = useLocale()
  return (
    <div className="flex items-center gap-2">
      <span className={lang==='en' ? 'font-semibold' : 'text-gray-500'}>EN</span>
      <Switch checked={lang==='hi'} onCheckedChange={toggle} aria-label="Language toggle" />
      <span className={lang==='hi' ? 'font-semibold' : 'text-gray-500'}>हिंदी</span>
    </div>
  )
}
