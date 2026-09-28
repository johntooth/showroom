import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import { readBranding, writeBranding } from "./branding-store.js"

const PORT = Number(process.env.PORT ?? 8080)
const STATIC_DIR = path.resolve(process.env.STATIC_DIR ?? "public")
const DATA_DIR = path.resolve(process.env.DATA_DIR ?? "data")
const MAX_BODY_BYTES = 1_000_000

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((error) => {
    const status = error?.statusCode ?? 500
    if (status === 500) console.error(error)
    sendJson(res, status, { error: status === 500 ? "Internal error." : error.message })
  })
})

async function handle(req, res) {
  const { pathname } = new URL(req.url ?? "/", "http://localhost")

  if (pathname === "/api/branding") return handleBranding(req, res)
  if (req.method !== "GET" && req.method !== "HEAD") {
    return sendJson(res, 405, { error: "Method not allowed." })
  }
  return serveStatic(pathname, req, res)
}

async function handleBranding(req, res) {
  if (req.method === "GET") {
    const body = JSON.stringify(await readBranding(DATA_DIR))
    const etag = `"${createHash("sha1").update(body).digest("base64url")}"`
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, { ETag: etag, "Cache-Control": "no-cache" })
      return res.end()
    }
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-cache",
      "Content-Length": Buffer.byteLength(body),
      ETag: etag,
    })
    return res.end(body)
  }

  if (req.method === "PUT") {
    const raw = await readBody(req)
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return sendJson(res, 400, { error: "Body must be valid JSON." })
    }
    const { value, error } = await writeBranding(DATA_DIR, parsed)
    if (error) return sendJson(res, 400, { error })
    return sendJson(res, 200, value)
  }

  return sendJson(res, 405, { error: "Method not allowed." })
}

async function serveStatic(pathname, req, res) {
  let relative
  try {
    relative = decodeURIComponent(pathname)
  } catch {
    return sendJson(res, 400, { error: "Bad request." })
  }

  const filePath = path.resolve(STATIC_DIR, relative === "/" ? "index.html" : relative.replace(/^\/+/, ""))
  if (filePath !== STATIC_DIR && !filePath.startsWith(STATIC_DIR + path.sep)) {
    return sendJson(res, 403, { error: "Forbidden." })
  }

  let info
  try {
    info = await stat(filePath)
  } catch {
    return sendJson(res, 404, { error: "Not found." })
  }
  if (!info.isFile()) return sendJson(res, 404, { error: "Not found." })

  // Vite fingerprints everything under assets/, so those are safe to pin.
  const isFingerprinted = filePath.startsWith(path.join(STATIC_DIR, "assets") + path.sep)
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": info.size,
    "Cache-Control": isFingerprinted ? "public, max-age=31536000, immutable" : "no-cache",
  })
  if (req.method === "HEAD") return res.end()
  createReadStream(filePath).pipe(res)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let rejected = false
    req.on("data", (chunk) => {
      // Keep draining after the limit rather than destroying the socket, so the
      // 413 actually reaches the client instead of looking like a network drop.
      if (rejected) return
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        rejected = true
        chunks.length = 0
        reject(Object.assign(new Error("Payload too large."), { statusCode: 413 }))
        return
      }
      chunks.push(chunk)
    })
    req.on("end", () => {
      if (!rejected) resolve(Buffer.concat(chunks).toString("utf8"))
    })
    req.on("error", reject)
  })
}

function sendJson(res, status, payload) {
  if (res.headersSent) return res.end()
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    // Stop an over-limit client from streaming the rest of its body at us.
    ...(status === 413 ? { Connection: "close" } : {}),
  })
  res.end(body)
}

server.listen(PORT, () => {
  console.log(`showroom serving ${STATIC_DIR} on :${PORT} (branding data in ${DATA_DIR})`)
})

// As PID 1 in a container, Node gets no default signal handlers — without these
// the runtime waits out its stop timeout and SIGKILLs on every redeploy.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 5_000).unref()
  })
}
