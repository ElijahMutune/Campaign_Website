
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../services/api'

const emptyData = {
  editors: [],
  news: [],
  events: [],
  documents: [],
  posters: [],
}

const loaders = {
  editors: () => adminApi.listEditors(),
  news: () => adminApi.listNews(),
  events: () => adminApi.listEvents(),
  documents: () => adminApi.listDocuments(),
  posters: () => adminApi.listPosters(),
}

export function useAdminOverview() {
  const [data, setData] = useState(emptyData)
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadOverview() {
      setIsLoading(true)

      const results = await Promise.all(
        Object.entries(loaders).map(async ([key, loader]) => {
          try {
            return {
              key,
              value: await loader(),
              error: null,
            }
          } catch (error) {
            return {
              key,
              value: [],
              error: `${key}: ${error.message}`,
            }
          }
        }),
      )

      if (!active) return

      const nextData = { ...emptyData }
      const nextErrors = []

      for (const result of results) {
        nextData[result.key] = result.value

        if (result.error) {
          nextErrors.push(result.error)
        }
      }

      setData(nextData)
      setErrors(nextErrors)
      setIsLoading(false)
    }

    loadOverview()

    return () => {
      active = false
    }
  }, [reloadKey])

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1)
  }, [])

  const stats = {
    editors: data.editors.length,
    news: data.news.length,
    events: data.events.length,
    resources: data.documents.length + data.posters.length,
    publishedNews: data.news.filter(
      (item) => item.status === 'published',
    ).length,
  }

  return {
    data,
    stats,
    errors,
    isLoading,
    refresh,
  }
}

