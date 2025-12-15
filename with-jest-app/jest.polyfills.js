// jest.polyfills.js
// Este archivo se carga ANTES que cualquier otro archivo de setup
// Polyfills necesarios para MSW v2 con Node.js

// IMPORTANTE: Definir los polyfills ANTES de importar undici
const { TextEncoder, TextDecoder } = require('util')
const { ReadableStream, WritableStream, TransformStream } = require('stream/web')
const { MessageChannel, BroadcastChannel } = require('worker_threads')

// Asignar los polyfills a global ANTES de cargar undici
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.ReadableStream = ReadableStream
global.WritableStream = WritableStream
global.TransformStream = TransformStream

// MessageChannel incluye MessagePort
const { port1 } = new MessageChannel()
global.MessageChannel = MessageChannel
global.MessagePort = port1.constructor

// BroadcastChannel
global.BroadcastChannel = BroadcastChannel

// AHORA sí podemos cargar undici
const { fetch, Headers, Request, Response, FormData, File } = require('undici')

// Fetch API
global.fetch = fetch
global.Headers = Headers
global.Request = Request
global.Response = Response
global.FormData = FormData
global.File = File
