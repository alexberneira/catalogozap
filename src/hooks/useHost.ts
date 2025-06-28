import { useState, useEffect } from 'react'

export function useHost() {
  const [host, setHost] = useState('')
  const [protocol, setProtocol] = useState('')
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHost = window.location.host
      const currentProtocol = window.location.protocol
      const currentBaseUrl = `${currentProtocol}//${currentHost}`
      
      setHost(currentHost)
      setProtocol(currentProtocol)
      setBaseUrl(currentBaseUrl)
    }
  }, [])

  return { host, protocol, baseUrl }
} 