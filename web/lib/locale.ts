import {createContext, useContext, useEffect, useState} from 'react'
import {defaultLocale} from 'web/lib/constants'

export function getTranslationMethod(locale: string | undefined, messages: Record<string, string>) {
  return (key: string, fallback: string, formatter?: any): string => {
    const result = locale === defaultLocale ? fallback : (messages[key] ?? fallback)
    if (!formatter) return result
    if (typeof formatter === 'function') return formatter(result)
    if (typeof formatter === 'object') {
      let text = String(result)
      for (const [k, v] of Object.entries(formatter)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
      return text
    }

    return result
  }
}

export type I18nContextType = {
  locale: string
  setLocale: (locale: string) => void
}

export const I18nContext = createContext<I18nContextType>({
  locale: defaultLocale,
  setLocale: () => {},
})

export function useLocale() {
  return useContext(I18nContext)
}

const messageCache: Record<string, Record<string, string>> = {}

export function useT() {
  const {locale} = useLocale()
  const [messages, setMessages] = useState<Record<string, string>>(messageCache[locale] ?? {})

  useEffect(() => {
    if (locale === defaultLocale) return
    if (messageCache[locale]) {
      setMessages(messageCache[locale])
      return
    }

    // import(`web/lib/messages/${locale}.json`)
    //   .then((mod) => {
    //     messageCache[locale] = mod.default
    //     setMessages(mod.default)
    //   })
    //   .catch(() => setMessages({}))

    setMessages({})
  }, [locale])

  return getTranslationMethod(locale, messages)
}
