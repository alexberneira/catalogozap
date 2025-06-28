'use client'

import { useEffect } from 'react'

interface CatalogTrackerProps {
  username: string
}

export default function CatalogTracker({ username }: CatalogTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch('/api/analytics/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        })
      } catch (error) {
        console.error('Erro ao registrar visualização:', error)
      }
    }

    // Registrar visualização após 2 segundos (para evitar bots)
    const timer = setTimeout(trackView, 2000)

    return () => clearTimeout(timer)
  }, [username])

  return null // Componente invisível
} 