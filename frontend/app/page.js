"use client"
import DistrictSelector from '../components/DistrictSelector'
import LanguageToggle from '../components/LanguageToggle'
import { useLocale } from '../store/useLocale'
import { t } from '../lib/i18n'

export default function Home() {
  const { lang } = useLocale()
  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <section className="bg-white rounded-2xl shadow p-6 md:p-10 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-primary mb-6">{t('home.title', lang)}</h1>
        <div className="mb-6">
          <DistrictSelector />
        </div>
      </section>
    </main>
  )
}
