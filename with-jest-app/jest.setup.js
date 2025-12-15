// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Los polyfills se cargan en jest.polyfills.js (setupFiles)
// Configurar MSW para los tests
import { server } from './mocks/server'

// Iniciar el servidor antes de todos los tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Resetear los handlers después de cada test para que no afecten entre sí
afterEach(() => server.resetHandlers())

// Limpiar después de todos los tests
afterAll(() => server.close())
