# Service Registrations

Microservicio **Service B** del monorepo Sistema-Eventos. Administra las inscripciones de asistentes
a eventos y la ocupacion (cupos disponibles / cupo completo / resumen), consumiendo la informacion de
eventos desde **Service Events** (Servicio A) via HTTP.

No implementa login ni registro de usuarios: toda autenticacion vive en `service-auth`. Este servicio
unicamente valida los JWT emitidos por `service-auth` y aplica su propia logica de negocio sobre
inscripciones y ocupacion.

---

## Arquitectura

```text
service-registrations/
│
├── index.js                     # Punto de entrada: conecta Mongo y levanta Express
├── package.json
│
├── configs/
│   ├── app.js                   # Ensambla Express: seguridad, rutas, swagger, errores
│   ├── db.js                    # Conexion a MongoDB (Mongoose)
│   ├── cors-configuration.js
│   ├── helmet-configuration.js
│   └── swagger.js               # Definicion OpenAPI + Bearer Auth
│
├── middlewares/
│   ├── validate-JWT.js          # Verifica firma, issuer, audience y expiracion (jwt.verify)
│   ├── validate-role.js         # Guard opcional por rol (req.user.roles)
│   ├── handle-errors.js         # Middleware central de errores (Mongo, Axios, validacion)
│   └── checkValidators.js       # Traduce errores de express-validator a la respuesta estandar
│
└── src/
    ├── clients/
    │   └── events.client.js     # Unico punto de acceso HTTP a Service Events (Axios)
    │
    ├── registrations/           # Feature: inscripciones
    │   ├── registrations.model.js
    │   ├── registrations.service.js
    │   ├── registrations.controller.js
    │   ├── registrations.validators.js
    │   └── registrations.router.js
    │
    └── occupancy/                # Feature: ocupacion de eventos
        ├── occupancy.service.js
        ├── occupancy.controller.js
        ├── occupancy.validators.js
        └── occupancy.router.js
```

Reglas de capas:

- Los **routers** solo declaran rutas y encadenan middlewares.
- Los **controladores** solo leen el request/response y llaman al servicio correspondiente (no
  acceden a Mongo ni usan Axios directamente).
- Toda la logica de negocio (validar cupos, evitar duplicados, calcular ocupacion, consultar
  Service Events) vive en `registrations.service.js` y `occupancy.service.js`.
- El **modelo** (`registrations.model.js`) es la unica representacion de persistencia.

---

## Instalacion

Este proyecto usa **pnpm** exclusivamente (no usar `npm` ni `yarn`).

```bash
cd service-registrations
pnpm install
cp .env.example .env   # y completar los valores reales
pnpm dev                # levanta el servidor con nodemon
```

### Scripts disponibles

| Script | Descripcion |
|--------|-------------|
| `pnpm dev` | Levanta el servidor con recarga automatica (nodemon) |
| `pnpm start` | Levanta el servidor en modo produccion |
| `pnpm lint` | Corre ESLint sobre todo el proyecto |
| `pnpm build` | Corre ESLint en modo estricto (`--max-warnings=0`) como chequeo de build |
| `pnpm test` | Corre la suite de pruebas con Jest + Supertest |

---

## Variables de entorno

Ver `.env.example`. Nunca se deben commitear secretos reales.

| Variable | Descripcion |
|----------|-------------|
| `NODE_ENV` | `development`, `production` o `test` |
| `PORT` | Puerto HTTP del servicio (por defecto `3002`) |
| `MONGO_URI` | Cadena de conexion a MongoDB |
| `EVENTS_SERVICE_URL` | URL base de Service Events (Servicio A). Ajustar al puerto real en el que corra ese servicio |
| `JWT_SECRET` | Secreto HS256 compartido. **Debe ser el mismo valor** que usa `service-auth` (`JWT_SECRET_KEY`) |
| `JWT_ISSUER` | Debe coincidir con `JwtSettings:Issuer` de `service-auth` (`sistema-eventos-auth`) |
| `JWT_AUDIENCE` | Debe coincidir con `JwtSettings:Audience` de `service-auth` (`sistema-eventos-services`) |
| `JWT_ALGORITHM` | Algoritmo de firma (`HS256`) |
| `CORS_ORIGIN` | Origen permitido para CORS (frontend) |

> **Puerto:** este servicio corre por defecto en `3002` para no chocar con `service-events` (`3000`)
> ni con `service-auth` (`5001`).

---

## Seguridad

- **Helmet** para cabeceras HTTP seguras.
- **CORS** restringido a `CORS_ORIGIN`.
- **express-rate-limit**: 100 solicitudes / 15 minutos por IP.
- **JWT obligatorio** en todos los endpoints de negocio (`validate-JWT.js`), verificado con
  `jwt.verify` (nunca `jwt.decode`), validando firma, `issuer`, `audience`, algoritmo y expiracion.
- **express-validator** valida toda entrada antes de llegar al controlador.
- Los errores nunca exponen stacktraces ni detalles internos (`handle-errors.js`).

---

## JWT

El token debe enviarse como:

```http
Authorization: Bearer <token>
```

Debe estar firmado por `service-auth` con el mismo secreto, `issuer` y `audience` configurados en
este servicio. Claims esperados (segun `service-auth`): `userId`, `email`, `roles`, `exp`, `iss`,
`aud`. El middleware `validate-JWT.js` adjunta el payload decodificado en `req.user` y el token
crudo en `req.token` (usado luego para reenviarlo a Service Events).

`validate-role.js` esta disponible como guard adicional por rol (`validateRole('admin', ...)`) para
usarse donde se requieran permisos mas restrictivos.

---

## Integracion con Service Events (Servicio A)

Todo el acceso HTTP a Service Events pasa exclusivamente por `src/clients/events.client.js`
(Axios), nunca desde controladores o routers. El Bearer Token recibido se reenvia tal cual.

```text
GET {EVENTS_SERVICE_URL}/events        -> lista de eventos
GET {EVENTS_SERVICE_URL}/events/:id    -> detalle de un evento
```

Contrato esperado de cada evento (con normalizacion defensiva de nombres de campo alternativos,
ya que Service Events aun no esta implementado al momento de construir este servicio):

```json
{
  "id": "string",
  "name": "string",
  "capacity": 100
}
```

Si Service Events no responde (caido / timeout), el cliente Axios lanza un error que
`handle-errors.js` traduce a `503 Service Unavailable`. Si el evento no existe (`404` de Service
Events), se traduce a un `404` propio con mensaje de negocio.

---

## Formato de respuestas

Exito:

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "",
  "error": "",
  "details": []
}
```

---

## Endpoints

Todos (excepto `/health`) requieren `Authorization: Bearer <token>`.

### `POST /registrations`

Registra un asistente a un evento. Flujo interno: valida el body, consulta el evento en Service
Events, valida que exista, obtiene su capacidad, cuenta los inscritos confirmados, valida cupos
disponibles, evita duplicados (mismo `eventId` + `attendeeEmail`) y guarda la inscripcion.

Payload:

```json
{
  "eventId": "64f1c2b7e1a2b3c4d5e6f7a8",
  "attendeeName": "Jane Doe",
  "attendeeEmail": "jane@example.com"
}
```

Respuesta `201`:

```json
{
  "success": true,
  "message": "Inscripcion registrada correctamente",
  "data": {
    "registration": {
      "id": "...",
      "eventId": "64f1c2b7e1a2b3c4d5e6f7a8",
      "attendeeName": "Jane Doe",
      "attendeeEmail": "jane@example.com",
      "status": "confirmed"
    },
    "occupancy": {
      "eventId": "64f1c2b7e1a2b3c4d5e6f7a8",
      "name": "Conferencia X",
      "capacity": 100,
      "registered": 41,
      "available": 59,
      "percentage": 41,
      "isFull": false
    }
  }
}
```

Errores: `400` (validacion), `404` (evento inexistente), `409` (cupo lleno o inscripcion duplicada).

### `DELETE /registrations/:id`

Cancela una inscripcion existente (`status -> cancelled`, `cancelledAt` con la fecha actual).
Errores: `404` (no existe), `409` (ya estaba cancelada).

### `GET /events/:id/attendees`

Lista los asistentes de un evento. Query param opcional `status` (`confirmed` | `cancelled` |
`all`, por defecto `confirmed`).

### `GET /events/available`

Lista los eventos que aun tienen cupos disponibles (consulta todos los eventos en Service Events y
cruza con el conteo de inscritos confirmados de cada uno).

### `GET /events/full`

Lista los eventos que alcanzaron su cupo maximo.

### `GET /summary`

Resumen agregado de ocupacion: total de eventos, eventos llenos, eventos disponibles, capacidad
total, inscritos totales, cupos disponibles totales y porcentaje global de ocupacion.

### `GET /health`

No requiere JWT.

```json
{
  "success": true,
  "service": "service-registrations",
  "status": "ok"
}
```

---

## Documentacion interactiva (Swagger)

Con el servidor levantado: `http://localhost:<PORT>/api-docs`. Incluye el esquema
`bearerAuth` para probar los endpoints protegidos directamente desde la interfaz.

---

## Pruebas

```bash
pnpm test
```

La suite (Jest + Supertest) cubre, sin depender de una base de datos ni de Service Events reales
(Mongoose y Axios se mockean):

- Registro exitoso de inscripcion y calculo de ocupacion resultante.
- Rechazo por evento inexistente (404) y por Service Events caido (503).
- Rechazo por cupo lleno y por inscripcion duplicada (409).
- Cancelacion de inscripcion, incluyendo casos de "no encontrada" y "ya cancelada".
- Conteo y listado de asistentes por evento y por estado.
- Eventos disponibles, eventos llenos y resumen de ocupacion (incluyendo que `available` nunca sea
  negativo).
- Middleware de JWT: sin token, token malformado, expirado, con `issuer` incorrecto y valido.
- `GET /health` sin necesidad de token.
- Middleware de errores: errores de Mongo (`CastError`, duplicado `11000`), errores de Axios (con y
  sin respuesta) y errores internos genericos (sin exponer el stacktrace).
- Falla de conexion a MongoDB: `configs/db.js` detiene el proceso (`process.exit(1)`) sin imprimir
  la cadena de conexion.
