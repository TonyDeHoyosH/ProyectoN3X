# Diagrama de Despliegue - GitHub Scout

## Arquitectura Local (Desarrollo)

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOST MACHINE (Tu PC)                         │
│                                                                 │
│  Windows 10/11 + Docker Desktop                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              DOCKER NETWORK (github_scout_default)       │  │
│  │                                                          │  │
│  │  ┌──────────────────┐  ┌──────────────────────────┐     │  │
│  │  │   PostgreSQL     │  │  Backend (FastAPI)       │     │  │
│  │  │   Container      │  │  Container               │     │  │
│  │  ├──────────────────┤  ├──────────────────────────┤     │  │
│  │  │ Image:           │  │ Image:                   │     │  │
│  │  │ postgres:15      │  │ proyecton3x-backend      │     │  │
│  │  │                  │  │                          │     │  │
│  │  │ Port:            │  │ Port:                    │     │  │
│  │  │ 5432:5432        │  │ 8000:8000                │     │  │
│  │  │                  │  │                          │     │  │
│  │  │ Volumes:         │  │ Volumes:                 │  │     │
│  │  │ /var/lib/        │  │ ./backend:./app          │     │  │
│  │  │ postgresql/data  │  │                          │     │  │
│  │  │ (postgres_data)  │  │ Environment:             │     │  │
│  │  │                  │  │ - DATABASE_URL           │     │  │
│  │  │ Environment:     │  │ - SECRET_KEY             │     │  │
│  │  │ - POSTGRES_USER  │  │ - FRONTEND_URL           │     │  │
│  │  │ - POSTGRES_PASS  │  │                          │     │  │
│  │  │ - POSTGRES_DB    │  │ Dependencies:            │     │  │
│  │  └──────────────────┘  │ - db (wait for it)       │     │  │
│  │         ▲               └──────────────────────────┘     │  │
│  │         │                          │                     │  │
│  │         │ Network                  │ HTTP              │  │
│  │         │ localhost:5432           │ localhost:8000   │  │
│  │         │                          │                  │  │
│  │  ┌──────┴──────────────────────────▼──────────────┐    │  │
│  │  │      Frontend (React) Container                │    │  │
│  │  ├──────────────────────────────────────────────┤    │  │
│  │  │ Image: proyecton3x-frontend                  │    │  │
│  │  │                                              │    │  │
│  │  │ Port: 5173:5173                              │    │  │
│  │  │                                              │    │  │
│  │  │ Volumes:                                     │    │  │
│  │  │ ./frontend:./app                             │    │  │
│  │  │                                              │    │  │
│  │  │ Environment:                                 │    │  │
│  │  │ - VITE_API_URL=http://localhost:8000         │    │  │
│  │  │                                              │    │  │
│  │  │ Dependencies:                                │    │  │
│  │  │ - backend (wait for it)                      │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    LOCALHOST                            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Frontend:  http://localhost:5173                        │  │
│  │ Backend:   http://localhost:8000                        │  │
│  │ Swagger:   http://localhost:8000/docs                  │  │
│  │ Database:  localhost:5432 (PgAdmin, DBeaver, etc)       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## docker-compose.yml Estructura

```yaml
version: '3.8'

services:
  # Base de datos
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: scout_admin
      POSTGRES_PASSWORD: scout_password
      POSTGRES_DB: scout_db

  # Backend API
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql+asyncpg://scout_admin:scout_password@db:5432/scout_db
      SECRET_KEY: supersecretkey_change_in_prod
    volumes:
      - ./backend:/app

  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:8000
    volumes:
      - ./frontend:/app

volumes:
  postgres_data:
```

---

## Flujo de Datos (Local)

```
┌─────────────────┐
│  Tu Navegador   │
│ localhost:5173  │
└────────┬────────┘
         │
         │ HTTP
         │ GET/POST requests
         │
         ▼
┌──────────────────────────────────────┐
│   Frontend Container (React)         │
│   - Sirve archivos estáticos         │
│   - Ejecuta JavaScript               │
│   - Hace requests a Backend          │
└────────┬─────────────────────────────┘
         │
         │ HTTP
         │ (dentro de docker network)
         │
         ▼
┌──────────────────────────────────────┐
│   Backend Container (FastAPI)        │
│   - Recibe requests HTTP             │
│   - Valida JWT                       │
│   - Procesa lógica                   │
│   - Consulta BD                      │
│   - Llama GitHub API                 │
└────────┬─────────────────────────────┘
         │
         ├─ SQL Queries
         │
         ▼
┌──────────────────────────────────────┐
│   PostgreSQL Container               │
│   - Almacena usuarios                │
│   - Almacena búsquedas               │
│   - Almacena repos guardados         │
└──────────────────────────────────────┘

         (Backend también)
         │
         ├─ HTTPS
         │
         ▼
┌──────────────────────────────────────┐
│   GitHub API (externo)               │
│   https://api.github.com             │
│   - Búsqueda de repos                │
│   - Datos de repositorios            │
└──────────────────────────────────────┘
```

---

## Contenedores Detallados

### 1. PostgreSQL Container

```
Nombre: proyecton3x-db-1

Image: postgres:15-alpine
- Basada en Alpine Linux (pequeña, ~200MB)
- PostgreSQL 15
- Incluye cliente psql

Puertos:
- 5432 (interno) → 5432 (host)
- Acceso: localhost:5432

Volúmenes:
- postgres_data:/var/lib/postgresql/data
  * Persiste datos entre reinicios
  * Sin esto, perderías la BD al hacer docker-compose down

Variables de Entorno:
- POSTGRES_USER=scout_admin
- POSTGRES_PASSWORD=scout_password
- POSTGRES_DB=scout_db

Lifespan:
1. Docker crea imagen
2. Inicia container
3. PostgreSQL inicia en background
4. Espera conexiones en puerto 5432
5. Backend espera a que esté listo (depends_on)
```

### 2. Backend Container

```
Nombre: proyecton3x-backend-1

Dockerfile: ./backend/Dockerfile
FROM python:3.11-slim

Puertos:
- 8000 (interno) → 8000 (host)
- Acceso: localhost:8000

Volúmenes:
- ./backend:/app
- Live reload (cambios se reflejan sin rebuild)

Variables de Entorno:
- DATABASE_URL=postgresql+asyncpg://scout_admin:...@db:5432/scout_db
  * Conecta a container "db" por nombre DNS
  * docker-compose resuelve "db" → IP del container
- SECRET_KEY=supersecretkey_change_in_prod
- FRONTEND_URL=http://localhost:5173

Comando:
uvicorn src.main:app --host 0.0.0.0 --port 8000
- 0.0.0.0 = escucha en todas las interfaces
- port 8000 = puerto interno del container

Dependencias:
- depends_on: db (espera a que PostgreSQL esté listo)

Lifespan:
1. Docker construye imagen (instala requirements.txt)
2. Copia código del backend
3. Inicia container
4. Ejecuta uvicorn
5. Espera requests en 0.0.0.0:8000
```

### 3. Frontend Container

```
Nombre: proyecton3x-frontend-1

Dockerfile: ./frontend/Dockerfile
FROM node:18-alpine

Puertos:
- 5173 (interno) → 5173 (host)
- Acceso: localhost:5173

Volúmenes:
- ./frontend:/app
- Live reload (Vite HMR)

Variables de Entorno:
- VITE_API_URL=http://localhost:8000
- Accesible en frontend como: import.meta.env.VITE_API_URL

Comando:
npm run dev
- Inicia Vite dev server en 0.0.0.0:5173
- HMR (Hot Module Replacement) habilitado

Dependencias:
- depends_on: backend

Lifespan:
1. Docker construye imagen (instala node_modules)
2. Copia código del frontend
3. Inicia container
4. Ejecuta "npm run dev"
5. Vite server escucha en 0.0.0.0:5173
```

---

## Network Docker

```
Nombre: proyecton3x_default

Tipo: Bridge network (default)

Todos los containers están conectados:
- db ↔ backend ↔ frontend
- Se pueden comunicar por nombre DNS

Resolución de DNS:
- "db" → resuelve a IP del container PostgreSQL
- "backend" → resuelve a IP del container FastAPI
- "frontend" → resuelve a IP del container React

Ejemplo en Backend:
DATABASE_URL = "postgresql://user:pass@db:5432/database"
                                     ^^
                                  DNS name
```

---

## Ciclo de Vida (Local)

```
$ docker-compose up -d --build

1. BUILD
   ├─ Construye imagen backend (Python 3.11 + requirements)
   ├─ Construye imagen frontend (Node 18 + npm packages)
   └─ Descarga imagen PostgreSQL (del registry)

2. CREATE
   ├─ Crea container PostgreSQL
   ├─ Crea container Backend
   └─ Crea container Frontend

3. START
   ├─ Inicia PostgreSQL
   ├─ Backend espera a que PostgreSQL esté listo
   ├─ Backend inicia cuando PostgreSQL está ready
   └─ Frontend inicia cuando Backend está ready

4. RUNNING
   ├─ PostgreSQL escucha en :5432
   ├─ Backend escucha en :8000
   ├─ Frontend escucha en :5173
   └─ Navegador conecta a localhost:5173

$ docker-compose down

1. STOP
   ├─ Para todos los containers gracefully (15 seg timeout)
   └─ Limpia network

2. REMOVE
   ├─ Elimina containers
   ├─ Elimina network
   └─ Mantiene volúmenes (postgres_data persiste)

$ docker-compose down -v

1. STOP (igual)
2. REMOVE (igual)
3. DELETE VOLUMES
   └─ Elimina postgres_data (DESTRUYE base de datos)
```

---

## Comandos Útiles

```bash
# Levanta todo
docker-compose up -d --build

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Ejecutar comando en container
docker-compose exec backend bash
docker-compose exec db psql -U scout_admin -d scout_db

# Reiniciar servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Detener y eliminar datos
docker-compose down -v

# Ver volúmenes
docker volume ls

# Inspeccionar container
docker inspect proyecton3x-backend-1
```

---

## Arquitectura de Producción (ejemplo)

```
┌────────────────────────────────────────────────────────────┐
│                    INTERNET                                │
└────────────────────────┬─────────────────────────────────┘
                         │
                         │ HTTPS
                         │
                    ┌────▼────┐
                    │ Vercel  │ (Frontend)
                    │ (React) │
                    └────┬────┘
                         │
                         │ HTTP
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼─────┐              ┌──────────▼──┐
    │  Railway  │ (Backend)   │  Railway    │ (DB)
    │ (FastAPI) │             │ (PostgreSQL)│
    └───────────┘             └─────────────┘
         │                           │
         └───────────────┬───────────┘
                         │
                    SSH/Secure
```

---

## Configuración por Ambiente

### Local (docker-compose.yml)

```yaml
backend:
  build: ./backend
  environment:
    DATABASE_URL: postgresql+asyncpg://scout_admin:scout_password@db:5432/scout_db
    SECRET_KEY: supersecretkey_change_in_prod
    FRONTEND_URL: http://localhost:5173
    COOKIE_SECURE: false       # HTTP allowed locally
    COOKIE_SAMESITE: lax
```

### Producción (ejemplo)

```yaml
backend:
  # Image from registry, no build
  image: registry.example.com/github-scout-backend:latest
  environment:
    DATABASE_URL: postgresql+asyncpg://user:pass@db.railway.app:5432/scout_prod
    SECRET_KEY: ${SECRET_KEY}        # From environment variables
    FRONTEND_URL: https://github-scout.vercel.app
    COOKIE_SECURE: true              # HTTPS only
    COOKIE_SAMESITE: strict
```

---

## Volúmenes Explicado

```
Tipos:

1. Named Volume (postgres_data)
   ├─ Almacenamiento administrado por Docker
   ├─ Persiste entre reinicios
   ├─ Ubicación: /var/lib/docker/volumes/
   └─ Uso: Base de datos, datos importantes

2. Bind Mount (./backend:/app)
   ├─ Mapea carpeta del host a container
   ├─ Cambios se reflejan en tiempo real
   ├─ Útil para desarrollo (hot reload)
   └─ Uso: Código fuente

3. tmpfs
   ├─ Almacenamiento en memoria
   ├─ Se pierde al reiniciar
   └─ Uso: Cache temporal, logs
```

---

## Health Checks

```yaml
backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

---

## Security Considerations

```
✅ PostgreSQL:
   - Password configurado (no default)
   - Acceso limitado a network docker

✅ Backend:
   - SECRET_KEY debe ser seguro en prod
   - HTTPS en producción
   - Cookies Secure + HttpOnly

✅ Frontend:
   - Construido como SPA
   - Sin credenciales en variables

⚠️ Falta en Producción:
   - TLS/SSL certificates
   - Reverse proxy (nginx)
   - Rate limiting
   - WAF (Web Application Firewall)
   - Logging centralizado
```

---

## Monitoreo

```
Herramientas útiles:

1. Docker Desktop Dashboard
   - GUI para gestionar containers
   - Ver logs en tiempo real
   - Monitoreo de recursos

2. Portainer
   - Web UI para Docker
   - Gestión de containers
   - Volúmenes, networks

3. Prometheus + Grafana
   - Métricas avanzadas
   - Alertas
   - Dashboards personalizados

4. ELK Stack (Elasticsearch, Logstash, Kibana)
   - Centralizar logs
   - Búsqueda y análisis
   - Alertas
```

---

## Troubleshooting

```
Port already in use (5173, 8000, 5432):
$ docker-compose down
$ docker ps -a
$ docker rm <container-id>

Container exits immediately:
$ docker-compose logs backend
→ Lee el error, generalmente en requirements o config

Network issues:
$ docker network ls
$ docker network inspect proyecton3x_default

Database issues:
$ docker-compose exec db psql -U scout_admin -d scout_db -c "\dt"
→ Ver tablas creadas

Memory issues:
$ docker stats
→ Ver uso de CPU y memoria por container
```