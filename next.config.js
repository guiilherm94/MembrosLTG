const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Service Worker customizado com lógica de push notifications
  swSrc: 'worker/index.js'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['drive.google.com', 'lh3.googleusercontent.com', 'img.youtube.com'],
  },
}

module.exports = withPWA(nextConfig)
