import '../styles/globals.css'
import 'web/lib/dayjs'

import clsx from 'clsx'
import type {AppProps} from 'next/app'
import Head from 'next/head'
import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'
import {DEPLOYED_WEB_URL, IS_VERCEL, PNG_LOGO} from 'web/lib/constants'
import {DAYJS_LOCALE_IMPORTS, registerDatePickerLocale} from 'web/lib/dayjs'
import {I18nContext} from 'web/lib/locale'
import {getLocale, resetCachedLocale} from 'web/lib/locale-cookie'
import {debug} from 'web/lib/logger'

function firstLine(msg: string) {
  return msg.replace(/\r?\n[\s\S]*/, '')
}

function printBuildInfo() {
  if (IS_VERCEL) {
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV
    const msg = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE
    const owner = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER
    const repo = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG
    const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    const url = `https://github.com/${owner}/${repo}/commit/${sha}`
    console.info(`Build: ${env} / ${firstLine(msg || '???')} / ${url}`)
  }
}

// specially treated props that may be present in the server/static props
type PageProps = object

function MyApp(props: AppProps<PageProps>) {
  const {Component, pageProps} = props
  useEffect(printBuildInfo, [])
  const router = useRouter()

  const [locale, setLocaleState] = useState<string>(getLocale())
  // console.log('_app locale', locale)
  const setLocale = (newLocale: string) => {
    debug('setLocale', newLocale)
    document.cookie = `lang=${newLocale}; path=/; max-age=31536000`
    setLocaleState(newLocale)
    resetCachedLocale()
    DAYJS_LOCALE_IMPORTS[newLocale]?.()
    registerDatePickerLocale(newLocale)
  }

  useEffect(() => {
    const handleBack = () => {
      router.back()
    }

    window.addEventListener('appBackButton', handleBack)
    return () => window.removeEventListener('appBackButton', handleBack)
  }, [router])

  const title = 'RCT Autism'
  const description = 'Effect of pre-session preparation on attention and engagement'

  return (
    <>
      <Head>
        <title>{title}</title>

        <meta name="description" content={description} key="description" />

        {/*OG tags (WhatsApp, Facebook, etc.)*/}
        <meta property="og:site_name" content="rct-autism" />
        <meta property="og:title" content={title} key="og-title" />
        <meta property="og:description" content={description} key="og-description" />
        <meta property="og:url" content={DEPLOYED_WEB_URL} key="og-url" />
        <meta property="og:image" content={PNG_LOGO} key="og-image" />
        <meta property="og:image:type" content="image/png" key="og-image-type" />

        {/*Twitter/X tags — separate!*/}
        <meta name="twitter:title" content={title} key="twitter-title" />
        <meta name="twitter:description" content={description} key="twitter-description" />
        <meta name="twitter:card" content="summary" key="twitter-card" />
        <meta name="twitter:image" content={PNG_LOGO} key="twitter-image" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1,maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <div className={clsx('contents font-normal')}>
        <I18nContext.Provider value={{locale, setLocale}}>
          <Component {...pageProps} />
        </I18nContext.Provider>
        <div id="headlessui-portal-root">
          <div />
        </div>
      </div>
    </>
  )
}

export default MyApp
