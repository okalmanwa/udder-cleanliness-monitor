import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import Navbar from './components/Navbar' // Removed old navbar

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UdderHygiene Monitor',
  description: 'Digital Udder Hygiene Monitoring System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col">
        <div className="flex-grow">
          {/* <Navbar /> Removed old navbar */}
          {children}
        </div>
      </body>
    </html>
  )
}
