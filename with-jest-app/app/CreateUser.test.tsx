import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateUser from './CreateUser'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('CreateUser Component', () => {
  it('renderiza el formulario correctamente', () => {
    render(<CreateUser />)

    expect(screen.getByText('Crear Nuevo Usuario')).toBeInTheDocument()
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('crea un usuario exitosamente con POST', async () => {
    render(<CreateUser />)

    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('submit-button')

    // Llenar el formulario
    fireEvent.change(nameInput, { target: { value: 'Pedro Martínez' } })
    fireEvent.change(emailInput, { target: { value: 'pedro@example.com' } })

    // Enviar formulario
    fireEvent.click(submitButton)

    // Verificar que el botón muestra "Creando..."
    expect(screen.getByText('Creando...')).toBeInTheDocument()

    // Esperar mensaje de éxito
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument()
    })

    expect(screen.getByText('¡Usuario creado exitosamente!')).toBeInTheDocument()
    expect(screen.getByText('Nombre: Pedro Martínez')).toBeInTheDocument()
    expect(screen.getByText('Email: pedro@example.com')).toBeInTheDocument()

    // Verificar que los campos se limpiaron
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })

  it('muestra error cuando falla la creación', async () => {
    // Sobrescribir handler para simular error
    server.use(
      http.post('/api/users', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    render(<CreateUser />)

    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('submit-button')

    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })

    expect(screen.getByText(/Error al crear usuario/)).toBeInTheDocument()
  })

  it('deshabilita el botón mientras está cargando', async () => {
    render(<CreateUser />)

    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('submit-button')

    fireEvent.change(nameInput, { target: { value: 'Test' } })
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    fireEvent.click(submitButton)

    // El botón debe estar deshabilitado durante la carga
    expect(submitButton).toBeDisabled()

    // Esperar a que termine
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('valida que los campos sean requeridos', () => {
    render(<CreateUser />)

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement
    const emailInput = screen.getByTestId('email-input') as HTMLInputElement

    // Verificar atributo required
    expect(nameInput.required).toBe(true)
    expect(emailInput.required).toBe(true)
  })
})
