import './globals.css'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const noto = Noto_Sans_Devanagari({ subsets: ['devanagari'], weight: ['400','700'], variable: '--font-noto' })

export const metadata = { title: 'MGNREGA District Dashboard' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${noto.variable} font-sans text-gray-900 bg-rose-50`}>{children}</body>
    </html>
  )
}
