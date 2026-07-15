# Sistema-Eventos

Práctica Técnica — monorepo de microservicios.

## Servicios

| Servicio | Tecnología | Responsable | Estado |
|----------|------------|-------------|--------|
| **service-auth** | .NET 8 / Clean Architecture | Auth team | Listo |
| Frontend | React | — | Pendiente |
| Service Events | Node.js | — | Pendiente |
| Service Registrations | Node.js | — | Pendiente |

---

## service-auth

Microservicio de autenticación listo para integración.

Documentación completa: [`service-auth/README.md`](./service-auth/README.md)

### Inicio rápido

```bash
cd service-auth
docker compose up -d          # solo PostgreSQL (puerto 5432)
dotnet run --project src/AuthService.Api
```

- API: http://localhost:5001  
- Swagger: http://localhost:5001/swagger  
- Health: http://localhost:5001/health  
- PostgreSQL: `localhost:5432` (`auth_service_eventos` / `auth_user` / `auth_password_dev`)  


### Endpoints principales

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET  /api/v1/auth/profile` (Bearer JWT)

### JWT compartido

Los demás servicios deben validar tokens con:

| Setting | Clave en código | Valor de desarrollo |
|---------|-----------------|---------------------|
| Issuer | `JwtSettings:Issuer` | `sistema-eventos-auth` |
| Audience | `JwtSettings:Audience` | `sistema-eventos-services` |
| Expiry | `JwtSettings:ExpiryInMinutes` | `60` |
| Algorithm | HS256 | HS256 |
| Secret | `JwtSettings:SecretKey` / `JWT_SECRET_KEY` | misma clave en todos los servicios |

Claims: `userId`, `email`, `roles`, `exp`, `iss`, `aud`.

Configuración detallada: [`service-auth/README.md`](./service-auth/README.md#cómo-carga-la-configuración-fuente-de-verdad-del-código).
