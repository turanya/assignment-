"use client"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLocale = create(persist((set)=>({
  lang: 'en',
  setLang: (lang)=> set({ lang }),
  toggle: ()=> set((s)=> ({ lang: s.lang === 'en' ? 'hi' : 'en' }))
}), { name: 'mgnrega-lang' }))
