# service-events

Microservicio responsable de la administración de eventos.

Tecnologías: Node.js, Express, MongoDB, Mongoose, JWT.

Variables de entorno: vea `.env.example`.

Instalación:

```bash
pnpm install
```

Ejecutar:

```bash
pnpm dev
```

Endpoints principales:

- `GET /health`
- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PUT /events/:id`
- `DELETE /events/:id`

Autenticación: token JWT en header `Authorization: Bearer <token>`.
