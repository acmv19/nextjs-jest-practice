# Guía Completa de MSW (Mock Service Worker) con Jest y Next.js

Esta guía te muestra cómo configurar y usar MSW v2 en tu proyecto de Next.js con Jest para mockear APIs en tus tests.

## 📋 Tabla de Contenidos

1. [¿Qué es MSW?](#qué-es-msw)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Creando Handlers](#creando-handlers)
6. [Escribiendo Tests](#escribiendo-tests)
7. [Técnicas Avanzadas](#técnicas-avanzadas)
8. [Solución de Problemas](#solución-de-problemas)

## ¿Qué es MSW?

**Mock Service Worker (MSW)** es una biblioteca para interceptar peticiones HTTP a nivel de red. A diferencia de mockear directamente las funciones de fetch, MSW intercepta las peticiones reales, lo que hace que tus tests sean más realistas y mantenibles.

### Ventajas de MSW:

- ✅ Tests más realistas (intercepta peticiones reales)
- ✅ Mismo código de mocking para tests y desarrollo
- ✅ No necesitas cambiar tu código de producción
- ✅ Fácil de configurar y mantener
- ✅ Soporta REST y GraphQL

## Instalación

### 1. Instalar MSW

```bash
npm install --save-dev msw@latest
```

### 2. Instalar Undici (para polyfills de fetch)

```bash
npm install --save-dev undici
```

## Configuración

### 1. Archivo de Polyfills (`jest.polyfills.js`)

Crea un archivo en la raíz del proyecto:

```javascript
// jest.polyfills.js
// Este archivo se carga ANTES que cualquier otro archivo de setup
// Polyfills necesarios para MSW v2 con Node.js

// IMPORTANTE: Definir los polyfills ANTES de importar undici
const { TextEncoder, TextDecoder } = require("util");
const {
  ReadableStream,
  WritableStream,
  TransformStream,
} = require("stream/web");
const { MessageChannel, BroadcastChannel } = require("worker_threads");

// Asignar los polyfills a global ANTES de cargar undici
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
global.TransformStream = TransformStream;

// MessageChannel incluye MessagePort
const { port1 } = new MessageChannel();
global.MessageChannel = MessageChannel;
global.MessagePort = port1.constructor;

// BroadcastChannel
global.BroadcastChannel = BroadcastChannel;

// AHORA sí podemos cargar undici
const { fetch, Headers, Request, Response, FormData, File } = require("undici");

// Fetch API
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
global.FormData = FormData;
global.File = File;
```

### 2. Actualizar `jest.setup.js`

```javascript
// jest.setup.js
import "@testing-library/jest-dom";

// Los polyfills se cargan en jest.polyfills.js (setupFiles)
// Configurar MSW para los tests
import { server } from "./mocks/server";

// Iniciar el servidor antes de todos los tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Resetear los handlers después de cada test para que no afecten entre sí
afterEach(() => server.resetHandlers());

// Limpiar después de todos los tests
afterAll(() => server.close());
```

### 3. Actualizar `jest.config.js`

```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFiles: ["<rootDir>/jest.polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(msw|@mswjs|@bundled-es-modules|until-async|strict-event-emitter|@open-draft)/)",
  ],
};

module.exports = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)();

  return {
    ...nextJestConfig,
    transformIgnorePatterns: [
      "/node_modules/(?!(msw|@mswjs|@bundled-es-modules|until-async|strict-event-emitter|@open-draft)/)",
    ],
  };
};
```

## Estructura de Archivos

```
proyecto/
├── mocks/
│   ├── handlers.ts          # Definiciones de los endpoints mockeados
│   └── server.ts            # Configuración del servidor MSW
├── app/
│   ├── UserList.tsx         # Componente de ejemplo
│   └── UserList.test.tsx    # Tests con MSW
├── jest.polyfills.js        # Polyfills para Node.js
├── jest.setup.js            # Configuración de Jest + MSW
└── jest.config.js           # Configuración de Jest
```

## Creando Handlers

### Archivo `mocks/handlers.ts`

```typescript
import { http, HttpResponse } from "msw";

export interface User {
  id: number;
  name: string;
  email: string;
}

const mockUsers: User[] = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com" },
  { id: 2, name: "María García", email: "maria@example.com" },
];

export const handlers = [
  // GET - Obtener todos los usuarios
  http.get("/api/users", () => {
    return HttpResponse.json(mockUsers);
  }),

  // GET - Obtener un usuario por ID
  http.get("/api/users/:id", ({ params }) => {
    const { id } = params;
    const user = mockUsers.find((u) => u.id === Number(id));

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  // POST - Crear un nuevo usuario
  http.post("/api/users", async ({ request }) => {
    const newUser = (await request.json()) as Omit<User, "id">;
    const user: User = {
      id: mockUsers.length + 1,
      ...newUser,
    };

    return HttpResponse.json(user, { status: 201 });
  }),

  // Ejemplo de error simulado
  http.get("/api/error", () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }),
];
```

### Archivo `mocks/server.ts`

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

## Escribiendo Tests

### Ejemplo Básico

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import UserList from "./UserList";

describe("UserList Component", () => {
  it("muestra la lista de usuarios después de cargar", async () => {
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
      expect(screen.getByText(/María García/)).toBeInTheDocument();
    });
  });
});
```

### Sobrescribir Handlers para Tests Específicos

```typescript
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

it("muestra error cuando la petición falla", async () => {
  // Sobrescribir el handler solo para este test
  server.use(
    http.get("/api/users", () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText(/Error/)).toBeInTheDocument();
  });
  // El handler se resetea automáticamente después del test
});
```

### Test de POST Requests

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateUser from "./CreateUser";

it("crea un usuario exitosamente", async () => {
  render(<CreateUser />);

  fireEvent.change(screen.getByTestId("name-input"), {
    target: { value: "Pedro" },
  });
  fireEvent.change(screen.getByTestId("email-input"), {
    target: { value: "pedro@example.com" },
  });
  fireEvent.click(screen.getByTestId("submit-button"));

  await waitFor(() => {
    expect(screen.getByText(/Usuario creado exitosamente/)).toBeInTheDocument();
  });
});
```

## Técnicas Avanzadas

### 1. Validar Request Body

```typescript
it("envía los datos correctos al servidor", async () => {
  let capturedBody: any = null;

  server.use(
    http.post("/api/users", async ({ request }) => {
      capturedBody = await request.json();
      return HttpResponse.json({ id: 1, ...capturedBody });
    })
  );

  // ... realizar la petición ...

  expect(capturedBody).toEqual({
    name: "Test",
    email: "test@test.com",
  });
});
```

### 2. Simular Delays

```typescript
server.use(
  http.get("/api/slow", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return HttpResponse.json({ message: "Respuesta lenta" });
  })
);
```

### 3. Respuestas Secuenciales

```typescript
it("reintenta después de un fallo", async () => {
  let callCount = 0;

  server.use(
    http.get("/api/retry", () => {
      callCount++;

      if (callCount === 1) {
        return new HttpResponse(null, { status: 500 });
      }

      return HttpResponse.json({ success: true });
    })
  );

  // Primera llamada falla
  const response1 = await fetch("/api/retry");
  expect(response1.status).toBe(500);

  // Segunda llamada tiene éxito
  const response2 = await fetch("/api/retry");
  expect(response2.status).toBe(200);
});
```

### 4. Headers Personalizados

```typescript
server.use(
  http.get("/api/custom", () => {
    return HttpResponse.json(
      { data: "test" },
      {
        headers: {
          "X-Custom-Header": "valor",
          "X-Rate-Limit": "100",
        },
      }
    );
  })
);
```

### 5. Query Parameters

```typescript
server.use(
  http.get("/api/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (query === "admin") {
      return HttpResponse.json({ results: ["Admin User"] });
    }

    return HttpResponse.json({ results: [] });
  })
);
```

## Solución de Problemas

### Problema: Tests no detectan las respuestas mockeadas

**Solución:** Asegúrate de que:

- El servidor MSW está iniciado en `beforeAll`
- Los handlers coinciden exactamente con las URLs de tus peticiones
- Estás usando `waitFor` para operaciones asíncronas

### Problema: "TextEncoder is not defined"

**Solución:** Asegúrate de que `jest.polyfills.js` está en `setupFiles` en tu jest.config.js

### Problema: "Cannot find module 'msw/node'"

**Solución:** Verifica que:

- MSW está instalado correctamente
- `transformIgnorePatterns` está configurado correctamente en jest.config.js

### Problema: Tests pasan pero con warnings de "act"

**Solución:** Estos warnings son normales cuando se hacen actualizaciones de estado. Usa `waitFor` para esperar a que terminen las actualizaciones.

## Ejemplos Completos

Revisa los siguientes archivos para ver ejemplos completos:

- [mocks/handlers.ts](mocks/handlers.ts) - Handlers de ejemplo
- [app/UserList.test.tsx](app/UserList.test.tsx) - Test de lista GET
- [app/UserProfile.test.tsx](app/UserProfile.test.tsx) - Test con parámetros
- [app/CreateUser.test.tsx](app/CreateUser.test.tsx) - Test de POST
- [mocks/msw-examples.test.ts](mocks/msw-examples.test.ts) - Técnicas avanzadas

## Comandos Útiles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests específicos de MSW
npm test -- --testPathPattern="(UserList|UserProfile|CreateUser)"

# Ejecutar con coverage
npm test -- --coverage

# Ejecutar en modo watch
npm test -- --watch
```

## Recursos Adicionales

- [Documentación oficial de MSW](https://mswjs.io/)
- [MSW con Next.js](https://mswjs.io/docs/integrations/node)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Resumen de Archivos Clave

| Archivo             | Propósito                                   |
| ------------------- | ------------------------------------------- |
| `jest.polyfills.js` | Polyfills necesarios para MSW v2 en Node.js |
| `jest.setup.js`     | Inicialización y configuración de MSW       |
| `jest.config.js`    | Configuración de Jest con MSW               |
| `mocks/handlers.ts` | Definiciones de endpoints mockeados         |
| `mocks/server.ts`   | Servidor MSW para tests                     |

---
