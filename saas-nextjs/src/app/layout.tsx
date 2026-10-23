import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL('https://app.dashboardmagico.com'),
  title: {
    default: 'Dashboards Automatizados | Inteligência Analítica Corporativa',
    template: '%s | Dashboards Automatizados',
  },
  description:
    'Plataforma corporativa SaaS para geração de Dashboards Automatizados e higienização inteligente de dados em tempo real.',
  applicationName: 'Dashboards Automatizados',
  alternates: {
    canonical: 'https://app.dashboardmagico.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} font-sans bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  )
}
