# Diagramas de Secuencia - GitHub Scout

## 1. Registro de Usuario

```
Usuario (Frontend)        Frontend              Backend               BD (PostgreSQL)
    |                        |                    |                        |
    |-- 1. Ingresa datos ---->|                    |                        |
    |                        |                    |                        |
    |                        |-- 2. POST /register -->|                        |
    |                        |   (email, password)    |                        |
    |                        |                    |-- 3. Valida email ---|
    |                        |                    |   y password        |
    |                        |                    |<-- 4. Email válido -|
    |                        |                    |                        |
    |                        |                    |-- 5. Hashea pwd ---|
    |                        |                    |   (bcrypt)          |
    |                        |                    |                        |
    |                        |                    |-- 6. INSERT users --->|
    |                        |                    |   (email, hash)     |
    |                        |                    |                        |
    |                        |                    |<-- 7. OK (id=1) ----|
    |                        |                    |                        |
    |                        |<-- 8. 201 Created ---|
    |                        |   {id, email}        |
    |                        |                        |
    |<-- 9. Success msg ---|                        |
    |                        |                        |
    |-- 10. Redirect login -->|                        |

FLUJO:
1. Usuario completa form con email + password
2. Frontend valida datos localmente
3. Frontend POST a /api/auth/register con credentials
4. Backend valida email format (Pydantic)
5. Backend valida password (6+ chars, hexadecimal)
6. Backend valida email único (query BD)
7. Backend hashea password con bcrypt
8. Backend INSERT en tabla users
9. Backend retorna 201 con user_id
10. Frontend muestra "Registro exitoso"
11. Frontend redirige a login
```

---

## 2. Login y Obtención de JWT

```
Usuario (Frontend)        Frontend              Backend               BD (PostgreSQL)
    |                        |                    |                        |
    |-- 1. Ingresa datos ---->|                    |                        |
    |                        |                    |                        |
    |                        |-- 2. POST /login --->|                        |
    |                        |   (email, password) |                        |
    |                        |                    |                        |
    |                        |                    |-- 3. SELECT users --->|
    |                        |                    |   WHERE email        |
    |                        |                    |                        |
    |                        |                    |<-- 4. User data ---|
    |                        |                    |   (id, hash)        |
    |                        |                    |                        |
    |                        |                    |-- 5. Verifica pwd ---|
    |                        |                    |   (bcrypt compare)  |
    |                        |                    |                        |
    |                        |                    |-- 6. Genera JWT -----|
    |                        |                    |   (user_id, exp)    |
    |                        |                    |                        |
    |                        |<-- 7. 200 OK -------|
    |                        |   Set-Cookie:        |
    |                        |   access_token=JWT   |
    |                        |   (HttpOnly)         |
    |                        |                        |
    |<-- 8. Cookie recibida-|                        |
    |                        |                        |
    |-- 9. Redirect dashboard -->|                    |

FLUJO:
1. Usuario ingresa email + password
2. Frontend POST a /api/auth/login
3. Backend busca usuario en BD por email
4. Backend obtiene user_id e hashed_password
5. Backend verifica password con bcrypt.verify()
6. Backend genera JWT token:
   - payload: {sub: user_id, exp: datetime}
   - signed with SECRET_KEY
7. Backend setea HttpOnly cookie con JWT
8. Backend retorna 200
9. Frontend recibe cookie automáticamente (navegador)
10. Frontend guarda estado de autenticación localmente
11. Frontend redirige a dashboard

SEGURIDAD:
- Password NUNCA viaja en texto plano
- JWT en cookie HttpOnly (no accesible por JavaScript)
- Secure flag en HTTPS
- SameSite=lax previene CSRF
```

---

## 3. Búsqueda de Repositorios

```
Usuario           Frontend            Backend             GitHub API          BD (PostgreSQL)
  |                   |                   |                   |                   |
  |-- 1. Busca ------->|                   |                   |                   |
  |                   |                   |                   |                   |
  |                   |-- 2. POST /search-->|                   |                   |
  |                   |   query, sort     |                   |                   |
  |                   |   + JWT (cookie)  |                   |                   |
  |                   |                   |                   |                   |
  |                   |                   |-- 3. Verifica JWT --|                   |
  |                   |                   |   (extrae user_id) |                   |
  |                   |                   |                   |                   |
  |                   |                   |-- 4. Valida params-|                   |
  |                   |                   |   (Pydantic)      |                   |
  |                   |                   |                   |                   |
  |                   |                   |-- 5. GET /search/repositories -------->|
  |                   |                   |   query=language:python stars:>1000|
  |                   |                   |                   |                   |
  |                   |                   |<-- 6. 200 OK --------|                   |
  |                   |                   |   {items: [...]}  |                   |
  |                   |                   |                   |                   |
  |                   |                   |-- 7. Parser -------|                   |
  |                   |                   |   extrae datos     |                   |
  |                   |                   |   (name, owner,    |                   |
  |                   |                   |    stars, url...)  |                   |
  |                   |                   |                   |                   |
  |                   |                   |-- 8. INSERT search_history -------->|
  |                   |                   |   (user_id, query, results_count)|
  |                   |                   |                   |                   |
  |                   |                   |<-- 9. OK ---------|                   |
  |                   |                   |                   |                   |
  |                   |<-- 10. 200 OK ---|                   |                   |
  |                   |   {total, page,   |                   |                   |
  |                   |    repositories}  |                   |                   |
  |                   |                   |                   |                   |
  |<-- 11. Resultados |                   |                   |                   |
  |    mostrados      |                   |                   |                   |

FLUJO:
1. Usuario ingresa criterios de búsqueda en frontend
2. Frontend valida (query no vacío, sort válido)
3. Frontend POST a /api/repos/search con JWT en cookie
4. Backend extrae JWT de cookie
5. Backend verifica JWT válido y obtiene user_id
6. Backend valida parámetros con Pydantic
7. Backend consulta GitHub API REST /search/repositories
8. GitHub API retorna JSON con resultados
9. Backend parsea respuesta:
   - Extrae: id, name, full_name, owner, url, stars, forks, language
   - Descarta el resto
10. Backend registra búsqueda en tabla search_history
11. Backend retorna JSON estructurado al frontend:
    {total: 245, page: 1, per_page: 20, repositories: [...]}
12. Frontend renderiza lista de repositorios
13. Usuario ve resultados paginados

CAPAS:
- Presentation: Lista visual con paginación
- API Gateway: Validación de entrada
- Use Case: Búsqueda + parseo
- Infrastructure: Llamadas a GitHub + BD
```

---

## 4. Guardar Repositorio Favorito

```
Usuario           Frontend            Backend             BD (PostgreSQL)
  |                   |                   |                   |
  |-- 1. Click ------>|                   |                   |
  |   "Guardar"       |                   |                   |
  |                   |                   |                   |
  |                   |-- 2. POST /save -->|                   |
  |                   |   github_id,      |                   |
  |                   |   name, url...    |                   |
  |                   |   + JWT (cookie)  |                   |
  |                   |                   |                   |
  |                   |                   |-- 3. Verifica JWT-|
  |                   |                   |   (user_id)       |
  |                   |                   |                   |
  |                   |                   |-- 4. INSERT saved_repositories |
  |                   |                   |   (user_id, github_id, ...)|
  |                   |                   |                   |
  |                   |                   |<-- 5. 201 OK ---|
  |                   |                   |   (id=42)         |
  |                   |                   |                   |
  |                   |<-- 6. 201 Created-|                   |
  |                   |                   |                   |
  |<-- 7. Confirmación|                   |                   |
  |    "Guardado!"    |                   |                   |

FLUJO:
1. Usuario en dashboard ve repositorio
2. Usuario hace click en botón "Guardar"
3. Frontend POST a /api/repos/save con:
   - github_id, name, full_name, owner, url, stars, language
   - JWT en cookie (autenticación)
4. Backend extrae JWT → user_id
5. Backend valida que no sea duplicado (UNIQUE constraint)
6. Backend INSERT en saved_repositories
7. Backend retorna 201 Created
8. Frontend muestra feedback: "Repositorio guardado!"
9. Frontend deshabilita botón (ya guardado)

ALTERNATIVA (Error - Ya guardado):
- Backend detecta UNIQUE violation
- Backend retorna 409 Conflict
- Frontend muestra: "Ya guardaste este repositorio"
```

---

## 5. Ver Repositorios Guardados

```
Usuario           Frontend            Backend             BD (PostgreSQL)
  |                   |                   |                   |
  |-- 1. Navega ----->|                   |                   |
  |   "Mis Repos"     |                   |                   |
  |                   |                   |                   |
  |                   |-- 2. GET /saved -->|                   |
  |                   |   + JWT (cookie)  |                   |
  |                   |                   |                   |
  |                   |                   |-- 3. Verifica JWT-|
  |                   |                   |   (user_id)       |
  |                   |                   |                   |
  |                   |                   |-- 4. SELECT ------>|
  |                   |                   |   saved_repos     |
  |                   |                   |   WHERE user_id   |
  |                   |                   |                   |
  |                   |                   |<-- 5. [repo1, ...)|
  |                   |                   |   (15 repos)      |
  |                   |                   |                   |
  |                   |<-- 6. 200 OK ---|                   |
  |                   |   {total: 15,     |                   |
  |                   |    repositories}  |                   |
  |                   |                   |                   |
  |<-- 7. Lista -------|                   |                   |
  |    mostrada       |                   |                   |

FLUJO:
1. Usuario navega a sección "Mis Repositorios"
2. Frontend GET a /api/repos/saved
3. Backend extrae JWT → user_id
4. Backend SELECT de saved_repositories WHERE user_id = X
5. Backend retorna JSON con lista
6. Frontend renderiza cards con repos
7. Usuario puede ver, descargar links, o eliminar

ESTADO:
- Sin repos: Mensaje "No has guardado repos aún"
- Con repos: Lista paginada
```

---

## 6. Eliminación de Repositorio

```
Usuario           Frontend            Backend             BD (PostgreSQL)
  |                   |                   |                   |
  |-- 1. Click ------>|                   |                   |
  |   "Eliminar"      |                   |                   |
  |                   |                   |                   |
  |                   |-- 2. Confirma ---|                   |
  |                   |   "¿Eliminar?"    |                   |
  |                   |                   |                   |
  |                   |-- 3. DELETE /saved|>|                   |
  |                   |   /42 (repo_id)   |                   |
  |                   |   + JWT (cookie)  |                   |
  |                   |                   |                   |
  |                   |                   |-- 4. Verifica JWT-|
  |                   |                   |   (user_id)       |
  |                   |                   |                   |
  |                   |                   |-- 5. DELETE ------>|
  |                   |                   |   WHERE id=42     |
  |                   |                   |   AND user_id=X   |
  |                   |                   |                   |
  |                   |                   |<-- 6. OK ---------|
  |                   |                   |                   |
  |                   |<-- 7. 204 No ---|
  |                   |    Content       |
  |                   |                   |
  |<-- 8. Eliminado --|                   |

FLUJO:
1. Usuario ve lista de repos guardados
2. Usuario hace click en X o "Eliminar"
3. Frontend muestra confirmación
4. Usuario confirma
5. Frontend DELETE a /api/repos/saved/{repo_id}
6. Backend verifica JWT → user_id
7. Backend valida que repo_id pertenezca a user_id (seguridad)
8. Backend DELETE de saved_repositories
9. Backend retorna 204 No Content
10. Frontend remueve repo de la lista
11. Usuario ve "Repositorio eliminado"

SEGURIDAD:
- Backend verifica que user_id coincida (no puedo eliminar repos de otro)
- Si no coincide → 403 Forbidden
```

---

## 7. Logout

```
Usuario           Frontend            Backend             
  |                   |                   |
  |-- 1. Click ------>|                   |
  |   "Logout"        |                   |
  |                   |                   |
  |                   |-- 2. POST /logout-|
  |                   |   + JWT (cookie)  |
  |                   |                   |
  |                   |                   |-- 3. Valida JWT -|
  |                   |                   |   (verifica aún)  |
  |                   |                   |                   |
  |                   |<-- 4. 200 OK ---|
  |                   |   Set-Cookie:    |
  |                   |   access_token="" |
  |                   |   max_age=0       |
  |                   |   (Elimina cookie)|
  |                   |                   |
  |<-- 5. Cookie -------|                   |
  |    eliminada      |                   |
  |                   |                   |
  |-- 6. Redirect --->|                   |
  |   login page      |                   |

FLUJO:
1. Usuario hace click en "Logout"
2. Frontend POST a /api/auth/logout
3. Backend recibe request
4. Backend crea Set-Cookie vacía (max_age=0)
5. Backend retorna 200
6. Navegador elimina cookie access_token
7. Frontend limpia estado local
8. Frontend redirige a /login
9. Usuario vuelve a login

RESULTADO:
- Cookie eliminada del navegador
- Usuario no autenticado
- Siguiente request sin JWT → 401
```

---

## Diagrama General de Capas

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│          - Components (Login, Dashboard, etc)            │
│          - Services (API calls con Axios)                │
│          - State Management                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │ JWT en Cookies
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                      │
├─────────────────────────────────────────────────────────┤
│ API Layer                                                │
│  - Routes: /auth/register, /auth/login, /repos/search   │
│  - Request/Response validation (Pydantic)               │
├─────────────────────────────────────────────────────────┤
│ Middleware Layer                                         │
│  - Auth middleware (JWT verification)                   │
│  - Error handler (global exceptions)                    │
│  - CORS middleware                                       │
├─────────────────────────────────────────────────────────┤
│ Use Cases Layer                                          │
│  - AuthUseCase (hash, verify, generate JWT)             │
│  - SearchReposUseCase (github + parser)                 │
├─────────────────────────────────────────────────────────┤
│ Infrastructure Layer                                     │
│  - DB (SQLAlchemy async + PostgreSQL)                   │
│  - GitHubClient (httpx async calls)                     │
│  - Parsers (extract relevant data)                      │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴──────────────┐
    │                           │
    ▼                           ▼
┌────────────────────┐    ┌──────────────────┐
│   PostgreSQL       │    │   GitHub API     │
│   (Persistencia)   │    │   (Datos externos)│
└────────────────────┘    └──────────────────┘
```

---

## Flujo de Autenticación en Cada Request

```
Todas las capas están protegidas por JWT:

1. Cliente envía request con cookie (navegador lo hace automáticamente)
2. FastAPI recibe request
3. Middleware extrae JWT de cookie
4. Middleware valida JWT signature
5. Middleware verifica expiración
6. Si válido: extrae user_id, continúa
7. Si inválido: retorna 401 Unauthorized

Esquema:
┌─────────────┐
│  Frontend   │ GET /api/repos/saved
│  (con JWT   │ Cookie: access_token=eyJ0eXAi...
│  en cookie) │
└────────┬────┘
         │
         ▼
┌─────────────────────────┐
│  FastAPI Middleware     │
│  1. Lee JWT de cookie   │
│  2. Valida signature    │
│  3. Valida expiración   │
│  4. Extrae user_id     │
└────────┬────────────────┘
         │
    ✓ Valid
         │
         ▼
┌─────────────────────────┐
│  Route Handler          │
│  /api/repos/saved       │
│  (user_id disponible)   │
└────────────────────────┘
```