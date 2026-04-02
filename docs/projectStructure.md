# Estructura de Carpetas - GitHub Scout

## Vista General

```
github-scout/
├── docs/                          # 📚 Documentación técnica
├── backend/                       # 🔧 Backend (FastAPI + Python)
├── frontend/                      # 🎨 Frontend (React + TypeScript)
├── docker-compose.yml             # 🐳 Orquestación de containers
├── .gitignore                     # 📝 Git ignore rules
└── README.md                      # 📖 Inicio rápido
```

---

## 📚 Carpeta: `docs/`

**Propósito:** Documentación técnica, arquitectura, especificaciones.

```
docs/
├── DATABASE.md                    # ER diagram + diccionario de datos
├── SQL_SCRIPTS.md                 # Scripts SQL para crear tablas
├── USE_CASES.md                   # Casos de uso del sistema
├── SEQUENCE_DIAGRAMS.md           # Diagramas de flujo entre capas
├── CLASS_DIAGRAMS.md              # Diagrama de clases + entidades
├── API_CONTRACT.md                # Endpoints del API REST
├── DEPLOYMENT_DIAGRAM.md          # Infraestructura Docker
└── JWT_FLOW.md                    # (Opcional) Flujo de autenticación
```

### Contenido de cada archivo

| Archivo | Descripción | Audiencia |
|---------|-------------|-----------|
| DATABASE.md | Tablas, columnas, relaciones, SQL | DBA, Backend |
| SQL_SCRIPTS.md | Queries de creación, inserción, búsqueda | DBA, Backend |
| USE_CASES.md | Qué hace el sistema (no cómo) | Product, QA |
| SEQUENCE_DIAGRAMS.md | Cómo fluye info entre capas | Frontend, Backend |
| CLASS_DIAGRAMS.md | Clases, métodos, propiedades | Backend |
| API_CONTRACT.md | Request/response de cada endpoint | Frontend, Backend |
| DEPLOYMENT_DIAGRAM.md | Containers, redes, volúmenes | DevOps, Backend |

---

## 🔧 Carpeta: `backend/`

**Propósito:** API FastAPI, lógica de negocio, acceso a datos.

```
backend/
├── src/                           # 📁 Código fuente principal
│   ├── __init__.py
│   ├── main.py                    # 🚀 Entrada de la aplicación (FastAPI app)
│   ├── config.py                  # ⚙️ Configuración centralizada
│   │
│   ├── domain/                    # 📊 Entidades de negocio (Clean Architecture)
│   │   ├── __init__.py
│   │   ├── user.py                # User entity (dataclass)
│   │   └── repository.py          # Repository entity (dataclass)
│   │
│   ├── use_cases/                 # 💼 Lógica de negocio (casos de uso)
│   │   ├── __init__.py
│   │   ├── auth_use_case.py       # Registro, login, validación password
│   │   └── search_repos_use_case.py # Búsqueda de repos en GitHub
│   │
│   ├── infrastructure/            # 🔌 Acceso a recursos externos
│   │   ├── __init__.py
│   │   ├── db.py                  # SQLAlchemy + PostgreSQL connection
│   │   ├── github_client.py       # Cliente async para GitHub API
│   │   └── parsers.py             # Parsea respuestas de GitHub
│   │
│   ├── api/                       # 🌐 Rutas HTTP (FastAPI routers)
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py            # POST /register, /login, /logout
│   │       └── repositories.py    # POST /search, GET /saved, etc
│   │
│   └── middlewares/               # 🛡️ Validación, seguridad, errores
│       ├── __init__.py
│       ├── auth.py                # JWT verification dependency
│       ├── validation.py          # Pydantic models (request validation)
│       └── error_handler.py       # Global exception handler
│
├── tests/                         # ✅ Tests unitarios
│   ├── __init__.py
│   ├── test_auth.py               # Tests para AuthUseCase
│   └── test_search.py             # Tests para SearchReposUseCase
│
├── requirements.txt               # 📦 Dependencias Python
├── .env.example                   # 📋 Variables de entorno (ejemplo)
├── Dockerfile                     # 🐳 Configuración Docker
└── .dockerignore                  # 📝 Archivos a ignorar en Docker

# Total: ~30-40 archivos Python
```

### Descripción por carpeta

#### `src/main.py`
```
- FastAPI application instance
- CORS middleware setup
- Route registration (include_router)
- Startup events (crear tablas BD)
- Health check endpoint
```

#### `src/config.py`
```
- Settings class con pydantic_settings
- DATABASE_URL
- SECRET_KEY, ALGORITHM
- FRONTEND_URL
- COOKIE_SECURE, COOKIE_SAMESITE
- Cargado desde .env automáticamente
```

#### `src/domain/`
```
- User (id, email, password, created_at)
- Repository (id, name, owner, stars, url, etc)
- Sin lógica, solo dataclasses
- Reutilizable en toda la app
```

#### `src/use_cases/`
```
- AuthUseCase (métodos estáticos)
  * validate_password()
  * hash_password()
  * verify_password()
  * create_access_token()
  * verify_token()
  * register()
  * login()

- SearchReposUseCase
  * execute(query, sort, per_page, page)
  * Orquesta github_client + parsers
```

#### `src/infrastructure/`
```
- db.py: SQLAlchemy async models
  * engine (AsyncEngine)
  * SessionLocal (async session factory)
  * UserModel, SearchHistoryModel, SavedRepositoryModel

- github_client.py: Async HTTP client
  * search_repositories(query, sort, per_page, page)

- parsers.py: Extrae datos relevantes
  * parse_repository(item)
  * parse_search_response(response)
```

#### `src/api/routes/`
```
- auth.py
  * POST /register
  * POST /login
  * POST /logout

- repositories.py
  * POST /search
  * GET /saved
  * POST /save
  * DELETE /saved/{id}
```

#### `src/middlewares/`
```
- auth.py
  * get_current_user() dependency
  * Extrae JWT de cookie
  * Verifica validez

- validation.py
  * RegisterRequest (email, password)
  * LoginRequest (email, password)
  * SearchQuery (query, sort, per_page, page)
  * Pydantic models con validators

- error_handler.py
  * Global exception handler
  * Retorna JSON estructurado
```

---

## 🎨 Carpeta: `frontend/`

**Propósito:** Interfaz React, comunicación con backend.

```
frontend/
├── src/                           # 📁 Código fuente
│   ├── main.tsx                   # 🚀 Entry point (ReactDOM.createRoot)
│   ├── App.tsx                    # 📱 Componente raíz
│   │
│   ├── components/                # 🧩 Componentes React
│   │   ├── Login.tsx              # Form email + password
│   │   ├── Register.tsx           # Form registro
│   │   ├── Dashboard.tsx          # Búsqueda + resultados
│   │   ├── RepositoryCard.tsx     # Card individual repo
│   │   └── Layout.tsx             # (Opcional) Layout común
│   │
│   ├── services/                  # 🔌 Comunicación API
│   │   └── api.ts                 # Axios instance + interceptors
│   │
│   ├── hooks/                     # 🪝 React hooks custom
│   │   ├── useAuth.ts             # Estado de autenticación
│   │   └── useQuery.ts            # (Opcional) Búsquedas
│   │
│   ├── types/                     # 📝 TypeScript interfaces
│   │   └── index.ts               # User, Repository, API responses
│   │
│   ├── styles/                    # 🎨 CSS/Tailwind
│   │   └── index.css              # Estilos globales
│   │
│   └── utils/                     # 🛠️ Utilidades
│       └── constants.ts           # URLs, constantes
│
├── public/                        # 📄 Assets estáticos
│   └── (iconos, favicons, etc)
│
├── index.html                     # 📋 HTML principal
├── package.json                   # 📦 Dependencias NPM
├── package-lock.json              # 🔒 Versiones exactas
├── tsconfig.json                  # ⚙️ Configuración TypeScript
├── tsconfig.node.json             # ⚙️ TypeScript para Vite
├── vite.config.ts                 # ⚙️ Configuración Vite
├── .env.example                   # 📋 Variables de entorno
├── Dockerfile                     # 🐳 Configuración Docker
└── .dockerignore                  # 📝 Archivos a ignorar

# Total: ~20-30 archivos TypeScript/React
```

### Descripción por carpeta

#### `main.tsx`
```
- import React, ReactDOM
- import App
- import styles (index.css)
- ReactDOM.createRoot(document.getElementById('root'))
- render(<App />)
```

#### `App.tsx`
```
- Router setup (si usa React Router)
- Layout principal
- Rutas: /login, /register, /dashboard
```

#### `components/`
```
Login.tsx:
- Form (email, password)
- Botón submit
- Link a register
- Llama authService.login()

Register.tsx:
- Form (email, password, confirm)
- Validación de password (6+, hex)
- Botón submit
- Link a login
- Llama authService.register()

Dashboard.tsx:
- Search bar (query, sort dropdown)
- Results list (paginación)
- Cada repo es RepositoryCard

RepositoryCard.tsx:
- Card con info del repo
- Stars, language, owner
- Botón "Ver en GitHub"
- Botón "Guardar" / "Guardado"
```

#### `services/api.ts`
```
- axios instance con baseURL
- withCredentials: true (envía cookies)
- Interceptor response (401 → redirige a login)

authService:
- register(email, password)
- login(email, password)
- logout()

reposService:
- search(query, sort, page)
- getSaved()
- saveRepository(data)
- deleteRepository(id)
```

#### `hooks/useAuth.ts`
```
- Estado: user, isAuthenticated, loading
- Funciones: login, logout, register
- useEffect para verificar session
- (Opcional: Context API para compartir)
```

#### `types/index.ts`
```
interface User {
  id: number
  email: string
  created_at: string
}

interface Repository {
  id: number
  name: string
  fullName: string
  owner: string
  ownerAvatar: string
  url: string
  stars: number
  language: string
  createdAt: string
  updatedAt: string
}

interface SearchResponse {
  total: number
  page: number
  per_page: number
  repositories: Repository[]
}
```

---

## 🐳 Archivos Raíz

```
github-scout/
├── docker-compose.yml             # Orquestación de 3 containers
├── .gitignore                     # Qué archivos NO subir a Git
├── README.md                      # Inicio rápido, instrucciones
└── (README es lo primero que ven evaluadores)
```

### `docker-compose.yml`
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    volumes: ["postgres_data:/var/lib/postgresql/data"]
    environment:
      POSTGRES_USER: scout_admin
      POSTGRES_PASSWORD: scout_password
      POSTGRES_DB: scout_db

  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql+asyncpg://scout_admin:...@db:5432/scout_db
      SECRET_KEY: supersecretkey_change_in_prod

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    depends_on: [backend]
    environment:
      VITE_API_URL: http://localhost:8000

volumes:
  postgres_data:
```

### `.gitignore`
```
# Python
__pycache__/
*.py[cod]
.Python
env/
venv/
.venv
*.egg-info/
dist/
build/

# Node
node_modules/
npm-debug.log
.npm

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore
```

### `README.md` (ejemplo mínimo)
```markdown
# GitHub Scout

Aplicación fullstack para buscar y guardar repositorios de GitHub.

## Stack
- Backend: FastAPI (Python)
- Frontend: React (TypeScript)
- Database: PostgreSQL
- Docker: docker-compose

## Inicio Rápido

### Requisitos
- Docker Desktop

### Levantar todo
```bash
docker-compose up -d --build
```

### Acceder
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs

### Parar
```bash
docker-compose down
```

## Documentación
- Ver carpeta `/docs` para arquitectura, diagramas, API contract
```

---

## 📁 Árbol Completo

```
github-scout/
│
├── docs/
│   ├── DATABASE.md
│   ├── SQL_SCRIPTS.md
│   ├── USE_CASES.md
│   ├── SEQUENCE_DIAGRAMS.md
│   ├── CLASS_DIAGRAMS.md
│   ├── API_CONTRACT.md
│   └── DEPLOYMENT_DIAGRAM.md
│
├── backend/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── domain/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── repository.py
│   │   ├── use_cases/
│   │   │   ├── __init__.py
│   │   │   ├── auth_use_case.py
│   │   │   └── search_repos_use_case.py
│   │   ├── infrastructure/
│   │   │   ├── __init__.py
│   │   │   ├── db.py
│   │   │   ├── github_client.py
│   │   │   └── parsers.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       └── repositories.py
│   │   └── middlewares/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── validation.py
│   │       └── error_handler.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   └── test_search.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── RepositoryCard.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   │       └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── .env.example
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Propósito de Cada Carpeta

| Carpeta | Propósito | Owner |
|---------|-----------|-------|
| docs/ | Documentación técnica | Tech Lead |
| backend/src/ | Lógica de negocio | Backend Dev |
| backend/tests/ | Verificación de código | Backend Dev + QA |
| frontend/src/ | Interfaz usuario | Frontend Dev |
| frontend/public/ | Assets estáticos | Frontend Dev |

---

## 📊 Estadísticas de Tamaño

```
backend/
- src/: ~2,000-3,000 líneas Python
- tests/: ~500-1,000 líneas
- Total: ~15-20 archivos Python

frontend/
- src/: ~1,500-2,500 líneas TypeScript/JSX
- Total: ~20-30 archivos

docs/
- Total: ~500-1,000 líneas Markdown
- 7-8 archivos

Líneas totales: ~4,000-5,500 (aprox)
```

---

## 🔄 Flujo de Desarrollo

```
1. Editar código
   ├─ backend/ → backend container (hot reload con volume mount)
   └─ frontend/ → frontend container (Vite HMR)

2. Ver cambios
   ├─ Backend: http://localhost:8000
   └─ Frontend: http://localhost:5173 (auto refresh)

3. Commit a Git
   ├─ git add .
   ├─ git commit -m "mensaje"
   └─ git push origin feature/xyz

4. Merge a main
   └─ Pull request en GitHub
```