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
        <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-400 to-blue-300 text-green-900 py-3 px-6 shadow-md">
          <div className="container mx-auto text-center">
            <p className="text-sm font-medium">© {new Date().getFullYear()} UdderHygiene Monitor. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
