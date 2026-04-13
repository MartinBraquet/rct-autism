export const MIN_INT = Number.MIN_SAFE_INTEGER
export const MAX_INT = Number.MAX_SAFE_INTEGER

export const supportEmail = 'martin.braquet@hotmail.com'

export const githubRepoSlug = 'MartinBraquet/rct-autism'
export const githubRepo = `https://github.com/${githubRepoSlug}`
export const githubIssues = `${githubRepo}/issues`

export const formLink = 'https://forms.gle/TODO'

export const defaultLocale = 'en'
export const LOCALES = {
  en: 'English',
  // fr: 'Français',
} as const

export const supportedLocales = Object.keys(LOCALES)
export type Locale = keyof typeof LOCALES

export const isProd = () => {
  if (process.env.ENVIRONMENT) {
    return process.env.ENVIRONMENT?.toUpperCase() == 'PROD'
  } else if (process.env.NEXT_PUBLIC_ENVIRONMENT) {
    return process.env.NEXT_PUBLIC_ENVIRONMENT?.toUpperCase() == 'PROD'
  }
  return false
}

export const ENV = isProd() ? 'prod' : 'dev'
export const IS_PROD = ENV === 'prod'
export const IS_DEV = ENV === 'dev'

export const IS_VERCEL = !!process.env.NEXT_PUBLIC_VERCEL
export const IS_DEPLOYED = IS_VERCEL
export const IS_LOCAL = !IS_DEPLOYED
export const HOSTING_ENV = IS_VERCEL
  ? 'Vercel'
  : IS_LOCAL
    ? 'local'
    : 'unknown'

if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'DEV')
  process.env.ENVIRONMENT = 'DEV'

if (IS_LOCAL && !process.env.ENVIRONMENT) {
    console.warn('No ENVIRONMENT set, defaulting to DEV')
    process.env.ENVIRONMENT = 'DEV'
  }

export const PNG_LOGO = 'https://www.compassmeet.com/icons/icon-512x512.png'


export const DEPLOYED_DOMAIN = 'rct-autism.vercel.app'
export const LOCAL_WEB_DOMAIN = `localhost:3000`
export const DOMAIN = IS_LOCAL ? LOCAL_WEB_DOMAIN : DEPLOYED_DOMAIN
export const DEPLOYED_WEB_URL = `https://${DEPLOYED_DOMAIN}`
export const WEB_URL = IS_LOCAL ? `http://${LOCAL_WEB_DOMAIN}` : `https://${DOMAIN}`