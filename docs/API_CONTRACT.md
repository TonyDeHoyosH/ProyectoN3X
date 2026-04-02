# API Contract - GitHub Scout

## Base URL

```
Local: http://localhost:8000
Production: https://api.github-scout.com (ejemplo)
```

---

## Autenticación

**Método:** JWT en HttpOnly Cookies

```
Cookie: access_token=eyJ0eXAiOiJKV1QiLCJhbGc...
Seguridad: HttpOnly, Secure, SameSite=Lax
```

**Endpoints protegidos:** Requieren JWT válido en cookie

---

## Endpoints

### 1. REGISTRO DE USUARIO

#### POST `/api/auth/register`

Registra un nuevo usuario.

**Headers:**
```
Content-Type: application/json
```

**Body (Request):**
```json
{
  "email": "tony@n3x.com",
  "password": "deadbeef1234567890abcdef"
}
```

**Validaciones:**
- `email`: Formato válido, único en BD
- `password`: 6+ caracteres, solo hexadecimal (0-9, a-f)

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "tony@n3x.com",
  "created_at": "2024-04-01T10:30:00Z"
}
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| 400 | `Email already registered` | Email duplicado |
| 400 | `Password must be at least 6 characters` | Password < 6 chars |
| 400 | `Password must be hexadecimal only` | Password con caracteres inválidos |
| 422 | `Invalid email format` | Email inválido |

---

### 2. LOGIN

#### POST `/api/auth/login`

Autentica usuario y retorna JWT en cookie.

**Headers:**
```
Content-Type: application/json
```

**Body (Request):**
```json
{
  "email": "tony@n3x.com",
  "password": "deadbeef1234567890abcdef"
}
```

**Response (200 OK):**
```json
{
  "message": "Logged in successfully"
}
```

**Headers de Response:**
```
Set-Cookie: access_token=eyJ0eXAi...; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| 401 | `Invalid credentials` | Email no existe o password incorrecto |
| 422 | `Invalid email format` | Email inválido |

---

### 3. LOGOUT

#### POST `/api/auth/logout`

Cierra sesión eliminando JWT.

**Headers:**
```
Authorization: Bearer {token} (o cookie automática)
Content-Type: application/json
```

**Body:** (vacío)

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Headers de Response:**
```
Set-Cookie: access_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| 401 | `Token not found` | No hay JWT |
| 401 | `Invalid token` | JWT expirado o inválido |

---

### 4. BUSCAR REPOSITORIOS

#### POST `/api/repos/search`

Busca repositorios en GitHub API.

**Autenticación:** Requerida ✅

**Headers:**
```
Content-Type: application/json
Cookie: access_token={JWT}
```

**Body (Request):**
```json
{
  "query": "language:python stars:>1000",
  "sort": "stars",
  "per_page": 20,
  "page": 1
}
```

**Parámetros:**

| Campo | Tipo | Requerido | Default | Rango |
|-------|------|-----------|---------|-------|
| query | string | Sí | - | 1-500 chars |
| sort | string | No | "stars" | "stars", "forks", "updated" |
| per_page | integer | No | 20 | 1-100 |
| page | integer | No | 1 | >= 1 |

**Ejemplos de Query:**
```
"language:python stars:>1000"
"language:go forks:>500"
"language:rust"
"type:user"
"topic:microservices"
```

**Response (200 OK):**
```json
{
  "total": 245,
  "page": 1,
  "per_page": 20,
  "repositories": [
    {
      "id": 123456789,
      "name": "kubernetes",
      "fullName": "kubernetes/kubernetes",
      "owner": "kubernetes",
      "ownerAvatar": "https://avatars.githubusercontent.com/u/13629408?v=4",
      "description": "Production-Grade Container Orchestration",
      "url": "https://github.com/kubernetes/kubernetes",
      "stars": 107000,
      "forks": 48000,
      "language": "Go",
      "createdAt": "2014-06-18T22:30:41Z",
      "updatedAt": "2024-04-01T12:45:30Z",
      "topics": ["kubernetes", "containers", "orchestration"]
    },
    {
      "id": 987654321,
      "name": "docker",
      "fullName": "moby/moby",
      "owner": "moby",
      "ownerAvatar": "https://avatars.githubusercontent.com/u/5429470?v=4",
      "description": "Moby Project - a collaborative project for the container community",
      "url": "https://github.com/moby/moby",
      "stars": 68000,
      "forks": 15000,
      "language": "Go",
      "createdAt": "2013-01-18T18:10:57Z",
      "updatedAt": "2024-04-01T11:20:15Z",
      "topics": ["docker", "containers", "moby"]
    }
  ]
}
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| 401 | `Token not found` | No hay JWT |
| 401 | `Invalid token` | JWT expirado |
| 422 | `Validation error` | Parámetros inválidos |
| 500 | `Error consulting GitHub API` | GitHub API no disponible |

---

### 5. GUARDAR REPOSITORIO

#### POST `/api/repos/save`

Guarda repositorio en favoritos del usuario.

**Autenticación:** Requerida ✅

**Headers:**
```
Content-Type: application/json
Cookie: access_token={JWT}
```

**Body (Request):**
```json
{
  "github_id": 123456789,
  "name": "kubernetes",
  "full_name": "kubernetes/kubernetes",
  "owner": "kubernetes",
  "url": "https://github.com/kubernetes/kubernetes",
  "stars": 107000,
  "language": "Go"
}
```

**Response (201 Created):**
```json
{
  "id": 42,
  "message": "Repository saved successfully"
}
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| 401 | `Token not found` | No hay JWT |
| 409 | `Already saved this repository` | Ya está guardado |
| 422 | `Validation error` | Datos inválidos |
| 500 | `Database error` | Error al guardar |

---

### 6. VER REPOSITORIOS GUARDADOS

#### GET `/api/repos/saved`

Obtiene todos los repositorios guardados del usuario.

**Autenticación:** Requerida ✅

**Headers:**
```
Cookie: access_token={JWT}
```

**Query Parameters:** (opcionales)
```
?page=1&per_page=20
```

**Response (200 OK):**
```json
{
  "total": 15,
  "page": 1,
  "per_page": 20,
  "repositories": [
    {
      "id": 42,
      "github_id": 123456789,
      "name": "kubernetes",
      "full_name": "kubernetes/kubernetes",
      "owner": "kubernetes",
      "url": "https://github.com/kubernetes/kubernetes",
      "stars": 107000,
      "language": "Go",
      "saved_at": "2024-04-01T10:15:00Z"
    },
    {
      "id": 43,
      "github_id": 987654321,
      "name": "docker",
      "full_name": "moby/moby",
      "owner": "moby",
      "url": "https://github.com/moby/moby",
      "stars": 68000,
      "language": "Go",
      "saved_at": "2024-04-01T09:30:00Z"
    }
  ]
}
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| 401 | `Token not found` | No hay JWT |
| 401 | `Invalid token` | JWT expirado |

---

### 7. ELIMINAR REPOSITORIO GUARDADO

#### DELETE `/api/repos/saved/{repo_id}`

Elimina un repositorio de los favoritos.

**Autenticación:** Requerida ✅

**URL Parameters:**
```
repo_id: integer (ID del registro guardado)
```

**Headers:**
```
Cookie: access_token={JWT}
```

**Response (204 No Content):**
```
(vacío)
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| 401 | `Token not found` | No hay JWT |
| 403 | `Permission denied` | Repo no pertenece al usuario |
| 404 | `Repository not found` | repo_id no existe |

---

### 8. HEALTH CHECK

#### GET `/api/health`

Verifica que el API esté funcionando.

**Autenticación:** No requerida

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|------------|
| 200 | OK - Request exitoso |
| 201 | Created - Recurso creado |
| 204 | No Content - Exitoso, sin body |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Falta JWT o expirado |
| 403 | Forbidden - Permisos insuficientes |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Recurso duplicado |
| 422 | Unprocessable Entity - Validación fallida |
| 500 | Internal Server Error - Error del servidor |

---

## Headers Comunes

### Request
```
Content-Type: application/json
Cookie: access_token={JWT}
```

### Response
```
Content-Type: application/json
Set-Cookie: access_token={JWT}; HttpOnly; Secure; SameSite=Lax
```

---

## Flujo de Autenticación en Requests Protegidos

```
1. Frontend envía request con cookie automáticamente
2. Backend extrae JWT de cookie
3. Backend verifica JWT (signature + expiración)
4. Si válido: extrae user_id, continúa
5. Si inválido: retorna 401 Unauthorized

NUNCA:
- El JWT va en Authorization header
- El JWT va en body del request
- El JWT va en URL parameters
- Solo en cookies HttpOnly
```

---

## Validaciones Comunes

### Email
```
Formato: RFC 5322
Ejemplo: tony@n3x.com
Requerido: Sí
Único: Sí
```

### Password
```
Mínimo: 6 caracteres
Máximo: 255 caracteres
Caracteres válidos: 0-9, a-f (hexadecimal)
Ejemplos válidos:
  - deadbeef
  - 1234567890abcdef
  - ffffffff00000000
Ejemplos inválidos:
  - 123456 (< 6 chars)
  - password (caracteres no hex)
  - Pass@123 (caracteres especiales)
```

### Query de Búsqueda
```
Mínimo: 1 carácter
Máximo: 500 caracteres
Requerido: Sí
Válidos: language:, stars:, forks:, type:, topic:, etc
Ejemplos:
  - "language:python stars:>1000"
  - "language:go"
  - "topic:microservices"
```

---

## Rate Limiting

```
GitHub API:
- 60 requests/hora (sin autenticación)
- 5000 requests/hora (con autenticación)

No hay rate limiting en nuestro API,
pero heredamos los límites de GitHub.
```

---

## CORS

```
Origen permitido: http://localhost:5173 (local)
Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS
Headers permitidos: Content-Type, Authorization
Credenciales: Sí (cookies)
```

---

## Seguridad

```
✅ HTTPS/TLS en producción (obligatorio)
✅ JWT firmado (no puede ser modificado)
✅ Cookie HttpOnly (no accesible por JavaScript)
✅ SameSite=Lax (protege contra CSRF)
✅ Password hasheado con bcrypt (nunca en texto plano)
✅ SQL prepared statements (protege contra SQL injection)
```

---

## Ejemplo de Uso Completo (Frontend)

```javascript
// 1. REGISTRO
POST /api/auth/register
{
  "email": "tony@n3x.com",
  "password": "deadbeef"
}
Response: { id: 1, email: "..." }

// 2. LOGIN
POST /api/auth/login
{
  "email": "tony@n3x.com",
  "password": "deadbeef"
}
Response: { message: "Logged in" }
→ Cookie automáticamente seteada

// 3. BUSCAR
POST /api/repos/search
{
  "query": "language:python stars:>1000",
  "sort": "stars",
  "per_page": 20,
  "page": 1
}
Response: { total: 245, repositories: [...] }
→ Cookie incluida automáticamente

// 4. GUARDAR
POST /api/repos/save
{
  "github_id": 123456789,
  "name": "kubernetes",
  ...
}
Response: { id: 42, message: "..." }

// 5. VER GUARDADOS
GET /api/repos/saved
Response: { total: 15, repositories: [...] }

// 6. ELIMINAR
DELETE /api/repos/saved/42
Response: (204 No Content)

// 7. LOGOUT
POST /api/auth/logout
Response: { message: "..." }
→ Cookie eliminada
```

---

## OpenAPI/Swagger

```
Documentación interactiva disponible en:
http://localhost:8000/docs

Especificación OpenAPI:
http://localhost:8000/openapi.json
```