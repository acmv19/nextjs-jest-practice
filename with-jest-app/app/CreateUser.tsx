'use client'

import { useState } from 'react'

interface User {
  id: number
  name: string
  email: string
}

export default function CreateUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [createdUser, setCreatedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCreatedUser(null)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })

      if (!res.ok) {
        throw new Error('Error al crear usuario')
      }

      const data = await res.json()
      setCreatedUser(data)
      setName('')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Crear Nuevo Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nombre:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            data-testid="name-input"
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="email-input"
          />
        </div>
        <button type="submit" disabled={loading} data-testid="submit-button">
          {loading ? 'Creando...' : 'Crear Usuario'}
        </button>
      </form>

      {error && <div data-testid="error">Error: {error}</div>}
      {createdUser && (
        <div data-testid="success-message">
          <p>¡Usuario creado exitosamente!</p>
          <p>Nombre: {createdUser.name}</p>
          <p>Email: {createdUser.email}</p>
          <p>ID: {createdUser.id}</p>
        </div>
      )}
    </div>
  )
}
