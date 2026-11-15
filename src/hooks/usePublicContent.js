
import { useCallback, useEffect, useState } from 'react'
import { ApiError, publicApi } from '../services/api'

const initialData = {
  candidate: null,
  headlines: [],
  manifesto: [],
  news: [],
  events: [],
  schedule: [],
  posters: [],
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value

  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.value)) return value.value

  return []
}

function normalizeCandidate(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  if (value.candidate && typeof value.candidate === 'object') {
    return value.candidate
  }

  if (value.data && typeof value.data === 'object') {
    return value.data
  }

  return value
}

const publicLoaders = {
  candidate: () => publicApi.getCandidate(),
  headlines: () => publicApi.getHeadlines(),
  manifesto: () => publicApi.getManifesto(),
  news: () => publicApi.getNews(),
  events: () => publicApi.getEvents('upcoming'),
  schedule: () => publicApi.getCampaignSchedule('upcoming'),
  posters: () => publicApi.getPosters(),
}

export function usePublicContent() {
  const [data, setData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadContent() {
      setIsLoading(true)

      const results = await Promise.all(
          Object.entries(publicLoaders).map(async ([key, loader]) => {
            try {
              const result = await loader()

              return {
                key,
                value: result,
                error: null,
              }
            } catch (error) {
              // A missing published candidate is a normal empty state.
              if (
                  key === 'candidate' &&
                  error instanceof ApiError &&
                  error.status === 404
              ) {
                return {
                  key,
                  value: null,
                  error: null,
                }
              }

              return {
                key,
                value: key === 'candidate' ? null : [],
                error:
                    error.message ||
                    'Unable to load this content.',
              }
            }
          }),
      )

      if (!active) return

      const nextData = { ...initialData }
      const nextErrors = {}

      for (const result of results) {
        if (result.key === 'candidate') {
          nextData.candidate = normalizeCandidate(result.value)
        } else {
          nextData[result.key] = normalizeArray(result.value)
        }

        if (result.error) {
          nextErrors[result.key] = result.error
        }
      }

      setData(nextData)
      setErrors(nextErrors)
      setIsLoading(false)
    }

    loadContent()

    return () => {
      active = false
    }
  }, [reloadKey])

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1)
  }, [])

  return {
    ...data,
    errors,
    isLoading,
    refresh,
  }
}
