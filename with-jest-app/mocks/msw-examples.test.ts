/**
 * EJEMPLOS AVANZADOS DE MSW
 * Este archivo demuestra diferentes técnicas y patrones con MSW
 */

import { server } from './server'
import { http, HttpResponse } from 'msw'

describe('Ejemplos Avanzados de MSW', () => {
  describe('1. Sobrescribir handlers para tests específicos', () => {
    it('ejemplo: simular diferentes códigos de estado', async () => {
      // Sobrescribir solo para este test
      server.use(
        http.get('/api/users', () => {
          return new HttpResponse(null, { status: 403 })
        })
      )

      const response = await fetch('/api/users')
      expect(response.status).toBe(403)
    })

    it('el handler original se restaura automáticamente', async () => {
      // Gracias a afterEach(() => server.resetHandlers()) en jest.setup.js
      const response = await fetch('/api/users')
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveLength(3)
    })
  })

  describe('2. Simular delays y timeouts', () => {
    it('ejemplo: respuesta con delay', async () => {
      server.use(
        http.get('/api/delayed', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return HttpResponse.json({ message: 'Respuesta retrasada' })
        })
      )

      const startTime = Date.now()
      const response = await fetch('/api/delayed')
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    }, 10000)
  })

  describe('3. Validar request body y headers', () => {
    it('ejemplo: validar que se envíen los headers correctos', async () => {
      let capturedHeaders: Headers | null = null

      server.use(
        http.post('/api/test', async ({ request }) => {
          capturedHeaders = request.headers
          return HttpResponse.json({ ok: true })
        })
      )

      await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123',
        },
        body: JSON.stringify({ test: true }),
      })

      expect(capturedHeaders?.get('Content-Type')).toBe('application/json')
      expect(capturedHeaders?.get('Authorization')).toBe('Bearer token123')
    })

    it('ejemplo: validar el body de la petición', async () => {
      let capturedBody: any = null

      server.use(
        http.post('/api/users', async ({ request }) => {
          capturedBody = await request.json()
          return HttpResponse.json({ id: 999, ...capturedBody }, { status: 201 })
        })
      )

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com' }),
      })

      expect(capturedBody).toEqual({
        name: 'Test',
        email: 'test@test.com',
      })
    })
  })

  describe('4. Simular diferentes respuestas según parámetros', () => {
    it('ejemplo: respuesta diferente según query params', async () => {
      server.use(
        http.get('/api/search', ({ request }) => {
          const url = new URL(request.url)
          const query = url.searchParams.get('q')

          if (query === 'admin') {
            return HttpResponse.json({ results: ['Admin User'] })
          }

          return HttpResponse.json({ results: [] })
        })
      )

      const response1 = await fetch('/api/search?q=admin')
      const data1 = await response1.json()
      expect(data1.results).toEqual(['Admin User'])

      const response2 = await fetch('/api/search?q=other')
      const data2 = await response2.json()
      expect(data2.results).toEqual([])
    })
  })

  describe('5. Simular errores de red', () => {
    it('ejemplo: simular error de red', async () => {
      server.use(
        http.get('/api/network-error', () => {
          return HttpResponse.error()
        })
      )

      await expect(fetch('/api/network-error')).rejects.toThrow()
    })
  })

  describe('6. Respuestas secuenciales', () => {
    it('ejemplo: primera llamada falla, segunda tiene éxito', async () => {
      let callCount = 0

      server.use(
        http.get('/api/retry', () => {
          callCount++

          if (callCount === 1) {
            return new HttpResponse(null, { status: 500 })
          }

          return HttpResponse.json({ success: true })
        })
      )

      // Primera llamada falla
      const response1 = await fetch('/api/retry')
      expect(response1.status).toBe(500)

      // Segunda llamada tiene éxito
      const response2 = await fetch('/api/retry')
      expect(response2.status).toBe(200)
      const data = await response2.json()
      expect(data.success).toBe(true)
    })
  })

  describe('7. Custom headers en respuestas', () => {
    it('ejemplo: agregar custom headers', async () => {
      server.use(
        http.get('/api/custom-headers', () => {
          return HttpResponse.json(
            { data: 'test' },
            {
              headers: {
                'X-Custom-Header': 'valor-personalizado',
                'X-Rate-Limit': '100',
              },
            }
          )
        })
      )

      const response = await fetch('/api/custom-headers')
      expect(response.headers.get('X-Custom-Header')).toBe('valor-personalizado')
      expect(response.headers.get('X-Rate-Limit')).toBe('100')
    })
  })

  describe('8. Simular paginación', () => {
    it('ejemplo: paginación con query params', async () => {
      server.use(
        http.get('/api/paginated', ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '10')

          const allItems = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            name: `Item ${i + 1}`,
          }))

          const start = (page - 1) * limit
          const end = start + limit
          const items = allItems.slice(start, end)

          return HttpResponse.json({
            items,
            page,
            limit,
            total: allItems.length,
            totalPages: Math.ceil(allItems.length / limit),
          })
        })
      )

      const response1 = await fetch('/api/paginated?page=1&limit=10')
      const data1 = await response1.json()
      expect(data1.items).toHaveLength(10)
      expect(data1.page).toBe(1)

      const response2 = await fetch('/api/paginated?page=2&limit=10')
      const data2 = await response2.json()
      expect(data2.items).toHaveLength(10)
      expect(data2.items[0].id).toBe(11)
    })
  })
})
