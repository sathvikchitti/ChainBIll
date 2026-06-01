'use client'

import { SessionProvider } from 'next-auth/react'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <html lang="en" className="light">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600&family=JetBrains+Mono:wght@500&family=Playfair+Display:wght@600;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
            rel="stylesheet"
          />
          <style>{`
            .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
          `}</style>
        </head>
        <body className="bg-background text-on-surface antialiased">
          {children}
        </body>
      </html>
    </SessionProvider>
  )
}
