import type {NextConfig} from 'next'
import {IS_LOCAL} from 'web/lib/constants'


const nextConfig: NextConfig = {
  output: undefined,
  // productionBrowserSourceMaps: !isAppBuild, // no source maps in Android build
  reactStrictMode: true,
  modularizeImports: {
    // heroicons v1 transforms removed — v2 has tree-shaking built in
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },
  transpilePackages: [],
  experimental: {
    serverSourceMaps: true,
    scrollRestoration: true,
    turbopackFileSystemCacheForDev: true, // filesystem cache for faster dev rebuilds
  },
  env: {
    NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID,
  },
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: IS_LOCAL,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {hostname: 'martinbraquet.com'},
      {hostname: 'lh3.googleusercontent.com'},
      {hostname: 'i.imgur.com'},
      {hostname: 'firebasestorage.googleapis.com'},
      {hostname: 'storage.googleapis.com'},
      {hostname: 'picsum.photos'},
      {hostname: '*.giphy.com'},
      {hostname: 'ui-avatars.com'},
      {hostname: 'localhost'},
      {hostname: '127.0.0.1'},
    ],
    // Allow private IPs for local OG image generation
    minimumCacheTTL: 0,
  },
  webpack: (config, {dev}) => {
    if (dev) {
      config.cache = {type: 'filesystem'}
      config.infrastructureLogging = {level: 'warn'}
      config.stats = 'minimal'
    }
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [{name: 'removeViewBox', active: false}],
              floatPrecision: 2,
            },
          },
        },
      ],
    })
  },
  async redirects() {
    return []
  },
}

export default nextConfig
