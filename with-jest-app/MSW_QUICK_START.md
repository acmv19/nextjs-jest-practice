# MSW Quick Start - Guía Rápida

## ✅ Configuración Completa

Tu proyecto ahora tiene **MSW (Mock Service Worker)** completamente configurado y funcionando con Jest y Next.js.

## 📊 Resultados de Tests

```
✓ 24 tests pasando
✓ 4 test suites completados
✓ Ejemplos de GET, POST, y manejo de errores
```

## 🎯 Lo que puedes hacer ahora

### 1. Ver los ejemplos funcionando

```bash
# Ejecutar todos los tests de MSW
npm test -- --testPathPattern="(UserList|UserProfile|CreateUser|msw-examples)"

# Ejecutar un test específico
npm test -- --testPathPattern="UserList"
```

### 2. Componentes de ejemplo creados

- **[UserList.tsx](app/UserList.tsx)** - Lista de usuarios con GET
- **[UserProfile.tsx](app/UserProfile.tsx)** - Búsqueda de usuario por ID
- **[CreateUser.tsx](app/CreateUser.tsx)** - Formulario con POST

### 3. Tests creados

- **[UserList.test.tsx](app/UserList.test.tsx)** - 4 tests de lista GET
- **[UserProfile.test.tsx](app/UserProfile.test.tsx)** - 5 tests con parámetros
- **[CreateUser.test.tsx](app/CreateUser.test.tsx)** - 5 tests de POST
- **[msw-examples.test.ts](mocks/msw-examples.test.ts)** - 10 ejemplos avanzados

## 🔥 Patrón básico para nuevos tests

```typescript
// 1. Importar MSW
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// 2. Escribir tu test
it('mi test', async () => {
  // Los handlers en mocks/handlers.ts ya están activos
  render(<MiComponente />)

  await waitFor(() => {
    expect(screen.getByText(/datos/)).toBeInTheDocument()
  })
})

// 3. Sobrescribir handler si necesitas (opcional)
it('test de error', async () => {
  server.use(
    http.get('/api/endpoint', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  // tu test aquí...
})
```

## 📁 Archivos de configuración clave

| Archivo | Descripción |
|---------|-------------|
| [jest.polyfills.js](jest.polyfills.js) | Polyfills para Node.js (TextEncoder, fetch, etc.) |
| [jest.setup.js](jest.setup.js) | Inicialización de MSW |
| [jest.config.js](jest.config.js) | Configuración de Jest con MSW |
| [mocks/handlers.ts](mocks/handlers.ts) | Tus endpoints mockeados |
| [mocks/server.ts](mocks/server.ts) | Servidor MSW |

## 🚀 Agregar un nuevo endpoint mockeado

1. Abre [mocks/handlers.ts](mocks/handlers.ts)
2. Agrega tu handler:

```typescript
export const handlers = [
  // ... handlers existentes ...

  // Tu nuevo handler
  http.get('/api/mi-endpoint', () => {
    return HttpResponse.json({ data: 'mi respuesta' })
  }),
]
```

3. ¡Listo! Todos los tests lo usarán automáticamente.

## 💡 Ejemplos rápidos

### GET simple
```typescript
http.get('/api/users', () => {
  return HttpResponse.json([{ id: 1, name: 'Juan' }])
})
```

### GET con parámetros
```typescript
http.get('/api/users/:id', ({ params }) => {
  const { id } = params
  return HttpResponse.json({ id, name: 'Juan' })
})
```

### POST
```typescript
http.post('/api/users', async ({ request }) => {
  const body = await request.json()
  return HttpResponse.json({ id: 1, ...body }, { status: 201 })
})
```

### Error 404
```typescript
http.get('/api/not-found', () => {
  return new HttpResponse(null, { status: 404 })
})
```

### Error 500
```typescript
http.get('/api/error', () => {
  return new HttpResponse(null, { status: 500 })
})
```

## 📚 Documentación completa

Para más detalles, revisa [MSW_GUIDE.md](MSW_GUIDE.md) que incluye:

- ✅ Instalación detallada
- ✅ Configuración paso a paso
- ✅ Técnicas avanzadas (delays, validación de headers, etc.)
- ✅ Solución de problemas
- ✅ Ejemplos completos

## 🎉 ¡Listo para usar!

Tu proyecto está completamente configurado. Puedes empezar a:

1. ✅ Escribir tests que hagan peticiones HTTP reales
2. ✅ Mockear APIs sin cambiar tu código de producción
3. ✅ Testear casos de éxito y error fácilmente
4. ✅ Validar que tu frontend maneja correctamente las respuestas

---

**Tip:** Los warnings de "act" son normales y no afectan el funcionamiento. Son solo informativos.
