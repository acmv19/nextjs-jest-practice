// mocks/handlers.ts
// Aquí definimos los handlers que interceptan las peticiones HTTP

import { http, HttpResponse } from 'msw'

// Definir tipos para nuestros datos de ejemplo
export interface User {
  id: number
  name: string
  email: string
}

export interface Post {
  id: number
  title: string
  body: string
  userId: number
}

// Datos de ejemplo
const mockUsers: User[] = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
  { id: 2, name: 'María García', email: 'maria@example.com' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com' },
]

const mockPosts: Post[] = [
  { id: 1, title: 'Primer Post', body: 'Contenido del primer post', userId: 1 },
  { id: 2, title: 'Segundo Post', body: 'Contenido del segundo post', userId: 1 },
  { id: 3, title: 'Post de María', body: 'Contenido de María', userId: 2 },
]

// Definir los handlers
export const handlers = [
  // GET - Obtener todos los usuarios
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers)
  }),

  // GET - Obtener un usuario por ID
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params
    const user = mockUsers.find((u) => u.id === Number(id))

    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(user)
  }),

  // POST - Crear un nuevo usuario
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json() as Omit<User, 'id'>
    const user: User = {
      id: mockUsers.length + 1,
      ...newUser,
    }

    mockUsers.push(user)
    return HttpResponse.json(user, { status: 201 })
  }),

  // GET - Obtener todos los posts
  http.get('/api/posts', () => {
    return HttpResponse.json(mockPosts)
  }),

  // GET - Obtener posts por usuario
  http.get('/api/users/:userId/posts', ({ params }) => {
    const { userId } = params
    const userPosts = mockPosts.filter((p) => p.userId === Number(userId))

    return HttpResponse.json(userPosts)
  }),

  // Ejemplo de error simulado
  http.get('/api/error', () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }),

  // Ejemplo con retraso (para simular loading)
  http.get('/api/slow', async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return HttpResponse.json({ message: 'Respuesta lenta' })
  }),
]
