# Auth Service (service-auth)

Microservicio de autenticación del monorepo **Sistema-Eventos**.

- **Stack:** .NET 8, ASP.NET Core Web API, EF Core, PostgreSQL, JWT, Argon2id, Serilog, Swagger, Docker  
- **Arquitectura:** Clean Architecture  
- **Puerto por defecto:** `5001` (local) / `8080` (contenedor)

---

## Arquitectura

```text
service-auth/
├── src/
│   ├── AuthService.Api/           # Controllers, middlewares, DI host, Swagger
│   ├── AuthService.Application/   # Casos de uso, DTOs, validadores, JWT, Argon2
│   ├── AuthService.Domain/        # Entidades y constantes
│   └── AuthService.Persistence/   # EF Core, repositorios, migraciones, seeds
└── tests/
    └── AuthService.Tests/
```

**Reglas:**

- Controllers sin lógica de negocio  
- Application contiene reglas de autenticación  
- Persistence solo acceso a datos  
- Domain sin dependencias de infraestructura  

---

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Registro + JWT |
| POST | `/api/v1/auth/login` | No | Login + JWT |
| GET | `/api/v1/auth/profile` | Bearer | Perfil |
| PUT | `/api/v1/auth/profile` | Bearer | Actualizar perfil |
| POST | `/api/v1/auth/change-password` | Bearer | Cambiar contraseña |
| POST | `/api/v1/auth/forgot-password` | No | Solicitar reset |
| POST | `/api/v1/auth/reset-password` | No | Reset con token |
| POST | `/api/v1/auth/verify-email` | No | Verificar email |
| POST | `/api/v1/auth/resend-verification` | No | Reenviar verificación |
| GET | `/health` | No | Health check |

### Formato de respuesta

Éxito:

```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Correo ya registrado",
  "error": "EMAIL_ALREADY_EXISTS"
}
```

---

## JWT (compatibilidad con otros servicios)

Claims emitidos:

| Claim | Descripción |
|-------|-------------|
| `sub` / `userId` | Id del usuario (GUID) |
| `email` | Correo |
| `role` / `roles` | Roles (User, Admin, Organizer) |
| `exp` | Expiración |
| `iss` | Issuer (`Jwt:Issuer` → default `AuthServiceBancario`) |
| `aud` | Audience (`Jwt:Audience` → default `ApiBancaria`) |

Algoritmo: **HS256**. Los demás microservicios deben validar el mismo `Issuer`, `Audience` y `SecretKey`.

---

## Cómo carga la configuración (fuente de verdad del código)

No existen `ServiceCollectionExtensions.cs` ni `AuthenticationExtensions.cs` en este proyecto. La carga ocurre en:

| Archivo | Rol |
|---------|-----|
| `Program.cs` | `WebApplication.CreateBuilder` + `BindAndValidateRequiredSettings()` + JWT Bearer |
| `Extensions/ConfigurationExtensions.cs` | Alias planos → claves jerárquicas + validación fail-fast + `IOptions<T>` |
| `Application/Options/*Options.cs` | Secciones: `Jwt`, `Cloudinary`, `Smtp`, `Resend`, `App` |
| `appsettings.json` | Estructura y defaults no secretos |
| `appsettings.Development.json` | Overrides de desarrollo (sin secretos) |
| User Secrets | Secretos locales (recomendado en Development) |

### Orden de carga (.NET)

1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. **User Secrets** (solo `Development`)
4. Variables de entorno
5. Argumentos de línea de comandos
6. `ConfigurationExtensions.OverrideFromEnv` (alias planos `JWT_*`, `CLOUDINARY_*`, etc.)

El código **consulta estas secciones** (nombres exactos del appsettings de eventos):

```text
ConnectionStrings:DefaultConnection
JwtSettings:SecretKey / Issuer / Audience / ExpiryInMinutes
CloudinarySettings:CloudName / ApiKey / ApiSecret / BaseUrl / DefaultAvatarPath / Folder
SmtpSettings:Host / Port / EnableSsl / Username / Password / FromEmail / FromName / Enabled / ...
AppSettings:FrontendUrl
Security:AllowedOrigins
Resend:ApiKey / FromEmail / FromName   (opcional)
```

### Convención de variables de entorno

| Preferida (nativa .NET) | Alias plano | Clave en código |
|-------------------------|-------------|-----------------|
| `JwtSettings__SecretKey` | `JWT_SECRET_KEY` | `JwtSettings:SecretKey` |
| `JwtSettings__Issuer` | `JWT_ISSUER` | `JwtSettings:Issuer` |
| `JwtSettings__Audience` | `JWT_AUDIENCE` | `JwtSettings:Audience` |
| `JwtSettings__ExpiryInMinutes` | `JWT_EXPIRY_IN_MINUTES` | `JwtSettings:ExpiryInMinutes` |
| `CloudinarySettings__CloudName` | `CLOUDINARY_CLOUD_NAME` | `CloudinarySettings:CloudName` |
| `SmtpSettings__Username` | `SMTP_USERNAME` | `SmtpSettings:Username` |
| `ConnectionStrings__DefaultConnection` | `POSTGRES_*` | `ConnectionStrings:DefaultConnection` |

Separador jerárquico en env: **`__`**.

### Valores de desarrollo (Sistema Eventos)

| Clave | Valor |
|-------|--------|
| Issuer | `sistema-eventos-auth` |
| Audience | `sistema-eventos-services` |
| Expiry | 60 minutos |
| Postgres | `localhost:5432` / `auth_service_eventos` / `auth_user` / `auth_password_dev` |
| Frontend | `http://localhost:5173` |
| Admin seed | `admin@eventos.local` / `Admin1234!` (rol **Admin**) |
| Registro | rol **User** |

### User Secrets

```bash
cd service-auth
dotnet user-secrets set "JwtSettings:SecretKey" "<SECRET>" --project src/AuthService.Api
dotnet user-secrets set "JwtSettings:Issuer" "sistema-eventos-auth" --project src/AuthService.Api
dotnet user-secrets set "JwtSettings:Audience" "sistema-eventos-services" --project src/AuthService.Api
```

> **Seguridad:** no subas secretos reales a repositorios públicos. Si ya se expusieron, rota Cloudinary/SMTP/JWT.

---

## Requisitos

- .NET 8 SDK  
- Docker / Docker Compose (recomendado)  
- PostgreSQL 16 (si no usa Docker)

---

## Variables en `.env` (recomendado)

Los secretos viven en **`service-auth/.env`** (gitignored). Plantilla: `.env.example`.

```bash
cd service-auth
cp .env.example .env
# editar .env con JWT, Cloudinary, SMTP, Postgres, etc.
```

La API carga el `.env` al arrancar (`DotEnvLoader` en `Program.cs`) y mapea a:

- `JwtSettings__*` / `JWT_SECRET_KEY`
- `CloudinarySettings__*` / `CLOUDINARY_*`
- `SmtpSettings__*` / `SMTP_*`
- `ConnectionStrings__DefaultConnection` / `POSTGRES_*`

Docker Compose también lee el mismo `.env` para PostgreSQL.

---

## Docker (solo PostgreSQL por ahora)

```bash
cd service-auth
# requiere .env (o usa defaults del compose)
docker compose up -d
```

| Recurso | Valor |
|---------|--------|
| Imagen | `postgres:16` |
| Contenedor | `auth-eventos-postgres` |
| Puerto host | `5432` → `5432` |
| Database | `auth_service_eventos` |
| User | `auth_user` |
| Password | `auth_password_dev` |

Connection string (definida en `.env`):

```text
Host=localhost;Port=5432;Database=auth_service_eventos;Username=auth_user;Password=auth_password_dev
```

La API .NET se ejecuta en el host (no en Docker todavía).

---

## Ejecutar en local

1. Levante PostgreSQL:

```bash
docker compose up -d
```

2. Configure secretos JWT (User Secrets recomendado) y ejecute la API:

```bash
# PowerShell
$env:ASPNETCORE_ENVIRONMENT="Development"

dotnet restore
dotnet build
dotnet run --project src/AuthService.Api
```

Las migraciones y seeds se aplican al iniciar la API (`DatabaseSeeder`).

---

## Migraciones

```bash
# Crear migración
dotnet ef migrations add NombreMigracion \
  --project src/AuthService.Persistence \
  --startup-project src/AuthService.Api \
  --output-dir Migrations

# Aplicar
dotnet ef database update \
  --project src/AuthService.Persistence \
  --startup-project src/AuthService.Api
```

En runtime, `DatabaseSeeder` ejecuta `MigrateAsync` y siembra roles: `User`, `Admin`, `Organizer`.

---

## Swagger

- URL: `/swagger`  
- Autenticación: botón **Authorize** → `Bearer {token}`  

---

## Seguridad

- Contraseñas con **Argon2id** (nunca texto plano)  
- JWT con validación de Issuer, Audience, Lifetime y firma  
- Rate limiting en endpoints sensibles de auth  
- CORS configurable  
- Middleware global de excepciones (sin stack traces al cliente)  
- Secretos solo por variables de entorno / configuración externa  

---

## Testing

```bash
dotnet test
```

Cubre: Argon2, JWT claims, registro, login, perfil, errores, Swagger y health.

### Postman

Importar en Postman:

1. `postman/AuthService.postman_collection.json`
2. `postman/AuthService.postman_environment.json` (opcional; la colección ya trae variables)

Seleccionar entorno **AuthService Local**, levantar la API en `http://localhost:5001` y ejecutar:

1. `GET Health`
2. `POST Login (admin seed)` o `POST Register`
3. `GET Profile` (el Bearer se rellena solo tras login/register)

---

## Integración con otros equipos

Base URL sugerida: `http://localhost:5001`

Ejemplo login:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Str0ng!Pass1"
}
```

Usar `data.accessToken` como:

```http
Authorization: Bearer <accessToken>
```

Roles por defecto al registrar: `User`.
