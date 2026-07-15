# Sistema-Eventos

Monorepo de **administración de eventos** (Práctica Técnica — 6to. Informática).

Arquitectura distribuida con:

| Componente | Tecnología | Puerto | Carpeta |
|------------|------------|--------|---------|
| Frontend | React + Vite | `5173` | `frontend-app/` |
| Auth | .NET 8 + PostgreSQL + Argon2 + JWT | `5001` | `service-auth/` |
| Servicio A — Eventos | Node.js + Express + MongoDB | `3001` | `service-events/` |
| Servicio B — Inscripciones | Node.js + Express + MongoDB | `3002` | `service-registrations/` |

> El profesor autorizó usar **.NET** para el servicio de autenticación. Events e Inscripciones usan **MongoDB**.

---

## Requisitos

- Node.js 18+ y **pnpm**
- .NET 8 SDK
- MongoDB en `localhost:27017`
- Docker (opcional, solo para PostgreSQL de auth)

---

## Configuración rápida

### 1. PostgreSQL (Auth)

```bash
cd service-auth
docker compose up -d
```

Copia/ajusta `service-auth/.env` (ver `service-auth/.env.example`).

### 2. JWT compartido (obligatorio)

Los tres backends deben usar el **mismo** secreto, issuer y audience:

| Variable | Valor de desarrollo |
|----------|---------------------|
| Secret | `CHANGE_ME_MIN_32_CHARS_SECRET_KEY_HERE!!` |
| Issuer | `sistema-eventos-auth` |
| Audience | `sistema-eventos-services` |

- Auth: `JWT_SECRET_KEY`
- Events / Registrations: `JWT_SECRET` (o `JWT_SECRET_KEY`)

### 3. Variables por servicio

| Servicio | Archivo | Notas |
|----------|---------|--------|
| Auth | `service-auth/.env` | Postgres + JWT |
| Events | `service-events/.env` | `PORT=3001`, `MONGO_URI`, JWT, `CORS_ORIGIN=http://localhost:5173` |
| Registrations | `service-registrations/.env` | `PORT=3002`, `EVENTS_SERVICE_URL=http://localhost:3001`, JWT |
| Frontend | `frontend-app/.env` | Ver `frontend-app/.env.example` |

**Frontend (`.env`):**

```env
VITE_AUTH_API_URL=http://localhost:5001
VITE_EVENTS_API_URL=http://localhost:3001
VITE_REGISTRATIONS_API_URL=http://localhost:3002
```

---

## Cómo ejecutar

Abre **4 terminales**:

### Terminal 1 — Auth

```bash
cd service-auth
dotnet run --project src/AuthService.Api
```

- API: http://localhost:5001  
- Swagger: http://localhost:5001/swagger  
- Health: http://localhost:5001/health  

### Terminal 2 — Events (Servicio A)

```bash
cd service-events
pnpm install
pnpm dev
```

- http://localhost:3001/health  

### Terminal 3 — Registrations (Servicio B)

```bash
cd service-registrations
pnpm install
pnpm dev
```

- http://localhost:3002/health  
- Swagger: http://localhost:3002/api-docs  

### Terminal 4 — Frontend

```bash
cd frontend-app
pnpm install
pnpm dev
```

- http://localhost:5173  

---

## Usuario admin (seed)

Al iniciar Auth se crea:

| Campo | Valor |
|-------|--------|
| Correo | `admin@eventos.local` |
| Contraseña | `Admin1234!` |
| Rol | Admin |

También puedes registrarte en `/registro`.

---

## Funcionalidades del frontend

- Registro e inicio de sesión (JWT en `localStorage`)
- Rutas protegidas
- CRUD de eventos (crear, listar, editar, eliminar, detalle)
- Búsqueda de eventos (nombre / lugar / fecha `YYYY-MM-DD`)
- Registro y cancelación de asistentes
- Eventos con **cupos disponibles**
- Eventos con **cupo completo**
- **Resumen de ocupación**

### Rutas UI

| Ruta | Descripción |
|------|-------------|
| `/login`, `/registro` | Auth |
| `/eventos` | Listado / administración |
| `/eventos/nuevo` | Crear |
| `/eventos/:id` | Detalle + inscripciones |
| `/eventos/:id/editar` | Editar |
| `/eventos/disponibles` | Cupos disponibles |
| `/eventos/completos` | Cupo completo |
| `/resumen` | Resumen de ocupación |

---

## Endpoints principales

### Auth (`:5001`)

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET  /api/v1/auth/profile` (Bearer)

### Servicio A — Events (`:3001`)

- `GET    /events`
- `GET    /events/:id`
- `POST   /events`
- `PUT    /events/:id`
- `DELETE /events/:id`

Query de búsqueda: `name`, `date`, `location`, `page`, `limit`.

### Servicio B — Registrations (`:3002`)

- `POST   /registrations`
- `DELETE /registrations/:id`
- `GET    /events/:id/attendees`
- `GET    /events/available`
- `GET    /events/full`
- `GET    /summary`

Todos los endpoints de negocio de A y B requieren `Authorization: Bearer <token>`.

---

## Comunicación entre servicios

```
Frontend ──HTTP──► Auth (:5001)
Frontend ──HTTP──► Events (:3001)
Frontend ──HTTP──► Registrations (:3002)
Registrations ──HTTP──► Events  (Axios, reenvía el JWT)
```

El Servicio B **no** solo reenvía: calcula ocupación, valida cupos, evita duplicados y genera el resumen.

---

## Estructura del monorepo

```text
Sistema-Eventos/
├── frontend-app/            # React (Vite)
├── service-auth/            # .NET 8 Auth + JWT + Argon2
├── service-events/          # Node/Express/Mongo — Gestión de eventos
├── service-registrations/   # Node/Express/Mongo — Inscripciones y ocupación
├── README.md
└── .gitignore
```

Cada servicio tiene su propio `package.json` / `.csproj`, dependencias y configuración.

---

## Trabajo colaborativo (Scrum)

- Cada integrante trabaja en su rama (`nombre-carnet`).
- Integración a `main` mediante **Pull Requests** al cerrar cada Sprint.
- No se desarrolla directo en `main`.

### Evidencia de PRs

Revisar en GitHub: [Prueba-Tecnica-Bim3/Sistema-Eventos](https://github.com/Prueba-Tecnica-Bim3/Sistema-Eventos) → Pull requests (merged).

Sprints de la práctica:

1. **Sprint 1** — Monorepo, auth, modelos, bootstrap de servicios y frontend inicial.  
2. **Sprint 2** — CRUD eventos, inscripciones, JWT, integración front ↔ APIs.  
3. **Sprint 3** — Cupos disponibles/completos, resumen, validaciones, UI final.

---

## Documentación adicional

- Auth: [`service-auth/README.md`](./service-auth/README.md)
- Events: [`service-events/README.md`](./service-events/README.md)
- Registrations: [`service-registrations/README.md`](./service-registrations/README.md)
- Frontend: [`frontend-app/README.md`](./frontend-app/README.md)

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `ERR_CONNECTION_REFUSED :3000` | Events está en **3001** | Usa `VITE_EVENTS_API_URL=http://localhost:3001` y reinicia Vite |
| `503` en `/summary` | Registrations no alcanza Events o JWT distinto | `EVENTS_SERVICE_URL=http://localhost:3001` + mismo `JWT_SECRET` |
| `401` en events/registrations | JWT secret / issuer / audience distintos a Auth | Alinear `.env` y reiniciar servicios |
| Login OK pero lista vacía de errores | Frontend con env viejo en memoria | Reinicia `pnpm dev` y hard refresh (Ctrl+Shift+R) |

---

## Licencia / uso académico

Proyecto académico — Desarrollo ágil de aplicación web (Variante 3).
