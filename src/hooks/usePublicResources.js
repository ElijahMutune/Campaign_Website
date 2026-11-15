
import { useEffect, useState } from 'react'
import { publicApi } from '../services/api'

export function usePublicResources() {
  const [documents, setDocuments] = useState([])
  const [posters, setPosters] = useState([])
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadResources() {
      const results = await Promise.allSettled([
        publicApi.getDocuments(),
        publicApi.getPosters(),
      ])

      if (!active) return

      const nextErrors = {}

      if (results[0].status === 'fulfilled') {
        setDocuments(results[0].value)
      } else {
        setDocuments([])
        nextErrors.documents =
          results[0].reason?.message || 'Unable to load documents.'
      }

      if (results[1].status === 'fulfilled') {
        setPosters(results[1].value)
      } else {
        setPosters([])
        nextErrors.posters =
          results[1].reason?.message || 'Unable to load campaign posters.'
      }

      setErrors(nextErrors)
      setIsLoading(false)
    }

    loadResources()

    return () => {
      active = false
    }
  }, [])

  return {
    documents,
    posters,
    errors,
    isLoading,
  }
}
