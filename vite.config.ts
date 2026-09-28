import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Connect, type Plugin } from 'vite'
import { readBranding, writeBranding } from './server/branding-store.js'

const DEV_DATA_DIR = '.data'

const handleBranding: Connect.NextHandleFunction = (req, res) => {
  const send = (status: number, payload: unknown) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(payload))
  }
  const fail = (error: unknown) => {
    console.error(error)
    send(500, { error: 'Internal error.' })
  }

  if (req.method === 'GET') {
    readBranding(DEV_DATA_DIR).then((branding) => send(200, branding), fail)
    return
  }
  if (req.method !== 'PUT') return send(405, { error: 'Method not allowed.' })

  const chunks: Buffer[] = []
  req.on('data', (chunk: Buffer) => chunks.push(chunk))
  req.on('end', () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      return send(400, { error: 'Body must be valid JSON.' })
    }
    writeBranding(DEV_DATA_DIR, parsed).then(
      ({ value, error }) => (error ? send(400, { error }) : send(200, value)),
      fail,
    )
  })
}

/** Serves the same /api/branding contract as server/index.js, so `pnpm dev` and `pnpm preview` behave like the container. */
function brandingApi(): Plugin {
  return {
    name: 'showroom-branding-api',
    configureServer(server) {
      server.middlewares.use('/api/branding', handleBranding)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/branding', handleBranding)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), brandingApi()],
})
