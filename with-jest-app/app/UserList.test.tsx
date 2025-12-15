import { render, screen, waitFor } from "@testing-library/react";
import UserList from "./UserList";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

describe("UserList Component", () => {
  it("muestra loading inicialmente", () => {
    render(<UserList />);
    expect(screen.getByText("Cargando usuarios...")).toBeInTheDocument();
  });

  it("muestra la lista de usuarios después de cargar", async () => {
    render(<UserList />);

    // Esperar a que desaparezca el loading
    await waitFor(() => {
      expect(
        screen.queryByText("Cargando usuarios...")
      ).not.toBeInTheDocument();
    });

    // Verificar que los usuarios se muestren
    expect(screen.getByText("Lista de Usuarios")).toBeInTheDocument();
    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
    expect(screen.getByText(/María García/)).toBeInTheDocument();
    expect(screen.getByText(/Carlos López/)).toBeInTheDocument();
  });

  it("muestra error cuando la petición falla", async () => {
    // Sobrescribir el handler para este test específico
    server.use(
      http.get("/api/users", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<UserList />);

    // Esperar a que aparezca el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/Error al cargar usuarios/)).toBeInTheDocument();
    });
  });

  it("muestra correctamente emails de usuarios", async () => {
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/juan@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/maria@example.com/)).toBeInTheDocument();
    });
  });
});
