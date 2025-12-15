// mocks/server.ts
// Configuración del servidor MSW para tests en Node.js (Jest)

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Crear el servidor con los handlers
export const server = setupServer(...handlers)
