'use client'

import { useState } from 'react'

interface User {
  id: number
  name: string
  email: string
}

export default function UserProfile() {
  const [userId, setUserId] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)
    setUser(null)

    try {
      const res = await fetch(`/api/users/${userId}`)

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Usuario no encontrado')
        }
        throw new Error('Error al cargar el usuario')
      }

      const data = await res.json()
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Buscar Usuario por ID</h2>
      <div>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Ingresa ID de usuario"
          data-testid="user-id-input"
        />
        <button onClick={fetchUser} data-testid="fetch-user-button">
          Buscar
        </button>
      </div>

      {loading && <div data-testid="loading">Cargando...</div>}
      {error && <div data-testid="error">Error: {error}</div>}
      {user && (
        <div data-testid="user-profile">
          <h3>{user.name}</h3>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
        </div>
      )}
    </div>
  )
}
