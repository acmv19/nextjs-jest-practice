import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UserProfile from './UserProfile'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('UserProfile Component', () => {
  it('renderiza el formulario correctamente', () => {
    render(<UserProfile />)

    expect(screen.getByText('Buscar Usuario por ID')).toBeInTheDocument()
    expect(screen.getByTestId('user-id-input')).toBeInTheDocument()
    expect(screen.getByTestId('fetch-user-button')).toBeInTheDocument()
  })

  it('busca y muestra un usuario existente', async () => {
    render(<UserProfile />)

    const input = screen.getByTestId('user-id-input')
    const button = screen.getByTestId('fetch-user-button')

    // Ingresar ID y hacer clic en buscar
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(button)

    // Verificar loading
    expect(screen.getByTestId('loading')).toBeInTheDocument()

    // Esperar a que se muestre el usuario
    await waitFor(() => {
      expect(screen.getByTestId('user-profile')).toBeInTheDocument()
    })

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Email: juan@example.com')).toBeInTheDocument()
  })

  it('muestra error cuando el usuario no existe (404)', async () => {
    render(<UserProfile />)

    const input = screen.getByTestId('user-id-input')
    const button = screen.getByTestId('fetch-user-button')

    // Buscar un ID que no existe
    fireEvent.change(input, { target: { value: '999' } })
    fireEvent.click(button)

    // Esperar mensaje de error
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })

    expect(screen.getByText(/Usuario no encontrado/)).toBeInTheDocument()
  })

  it('muestra error cuando la API falla', async () => {
    // Sobrescribir el handler para simular error de servidor
    server.use(
      http.get('/api/users/:id', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    render(<UserProfile />)

    const input = screen.getByTestId('user-id-input')
    const button = screen.getByTestId('fetch-user-button')

    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })

    expect(screen.getByText(/Error al cargar el usuario/)).toBeInTheDocument()
  })

  it('no hace fetch si el input está vacío', () => {
    render(<UserProfile />)

    const button = screen.getByTestId('fetch-user-button')
    fireEvent.click(button)

    // No debería aparecer loading
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
  })
})
