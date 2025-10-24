import type { Metadata } from 'next'
import './globals.css'
import 'flag-icons/css/flag-icons.min.css'

export const metadata: Metadata = {
  title: 'Younosomy - Economic Simulator',
  description: 'A real-time economic and political strategy simulator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
