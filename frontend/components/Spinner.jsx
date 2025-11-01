"use client"
import { Loader2 } from 'lucide-react'
export default function Spinner({ className }){ return <Loader2 className={className||'w-6 h-6 animate-spin text-primary'} /> }
