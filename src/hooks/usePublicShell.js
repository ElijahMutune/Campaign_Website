
import { useEffect, useState } from 'react'
import { publicApi } from '../services/api'

export function usePublicShell() {
  const [settings, setSettings] = useState(null)
  const [navigation, setNavigation] = useState([])
  const [socialLinks, setSocialLinks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let active = true

    async function loadShell() {
      const resources = [
        ['settings', publicApi.getSettings, setSettings, null],
        ['navigation', publicApi.getNavigation, setNavigation, []],
        ['socialLinks', publicApi.getSocialLinks, setSocialLinks, []],
      ]

      const results = await Promise.all(
        resources.map(async ([key, loader, setter, fallback]) => {
          try {
            const value = await loader()
            return { key, setter, value, error: null }
          } catch (error) {
            return {
              key,
              setter,
              value: fallback,
              error: error.message || 'Unable to load website information.',
            }
          }
        }),
      )

      if (!active) return

      const nextErrors = {}

      for (const result of results) {
        result.setter(result.value)

        if (result.error) {
          nextErrors[result.key] = result.error
        }
      }

      setErrors(nextErrors)
      setIsLoading(false)
    }

    loadShell()

    return () => {
      active = false
    }
  }, [])

  return {
    settings,
    navigation,
    socialLinks,
    errors,
    isLoading,
  }
}
