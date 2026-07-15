# Frontend — Sistema de Eventos

React + Vite + React Router.

## Scripts

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build
pnpm preview
```

## Variables de entorno

Copia `.env.example` a `.env`:

```env
VITE_AUTH_API_URL=http://localhost:5001
VITE_EVENTS_API_URL=http://localhost:3001
VITE_REGISTRATIONS_API_URL=http://localhost:3002
```

Reinicia Vite después de cambiar el `.env`.

## Funcionalidades

- Auth (registro / login) con JWT
- CRUD de eventos
- Inscripciones y cancelaciones
- Cupos disponibles / cupo completo
- Resumen de ocupación
