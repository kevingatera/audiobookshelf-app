/**
 * Dev-only proxy middleware.
 * Forwards API paths to the remote Audiobookshelf server.
 * Only matches: /api/*, /login, /ping, /status, /auth/*, /socket.io/*, /s/*
 * Does NOT match Nuxt SPA routes like /bookshelf, /settings, /search, etc.
 */
const { createProxyMiddleware } = require('http-proxy-middleware')

const TARGET = process.env.ABS_PROXY_TARGET || 'https://audiobooks.deployitwith.me'

// Precise path filter to avoid catching Nuxt SPA routes
const pathFilter = (pathname) => {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/api?') ||
    pathname === '/api' ||
    pathname === '/login' ||
    pathname.startsWith('/login?') ||
    pathname === '/ping' ||
    pathname.startsWith('/ping?') ||
    pathname === '/status' ||
    pathname.startsWith('/status?') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/socket.io') ||
    pathname.startsWith('/s/')
  )
}

module.exports = createProxyMiddleware(pathFilter, {
  target: TARGET,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
  onProxyReq(proxyReq, req) {
    proxyReq.setHeader('X-Forwarded-Host', req.headers.host || 'localhost:1337')
  },
})
