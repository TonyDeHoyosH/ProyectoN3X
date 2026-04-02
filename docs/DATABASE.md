# Database Schema - GitHub Scout

## Diagrama ER (Entidad-Relación)

```
┌──────────────────┐
│     USERS        │
├──────────────────┤
│ id (PK)          │
│ email (UNIQUE)   │
│ hashed_password  │
│ created_at       │
└──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────────┐
│  SEARCH_HISTORY          │
├──────────────────────────┤
│ id (PK)                  │
│ user_id (FK)             │
│ query                    │
│ sort                     │
│ results_count            │
│ created_at               │
└──────────────────────────┘

┌──────────────────────────┐
│ SAVED_REPOSITORIES       │
├──────────────────────────┤
│ id (PK)                  │
│ user_id (FK)             │
│ github_id (UNIQUE)       │
│ name                     │
│ full_name                │
│ owner                    │
│ url                      │
│ stars                    │
│ language                 │
│ saved_at                 │
└──────────────────────────┘
```

---

## Diccionario de Datos

### Tabla 1: USERS

| Campo | Tipo | Restricción | Descripción |
|-------|------|---|---|
| id | SERIAL | PRIMARY KEY | ID único del usuario |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email (login) |
| hashed_password | VARCHAR(255) | NOT NULL | Contraseña hasheada bcrypt |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

---

### Tabla 2: SEARCH_HISTORY

| Campo | Tipo | Restricción | Descripción |
|-------|------|---|---|
| id | SERIAL | PRIMARY KEY | ID único del registro |
| user_id | INTEGER | FK → USERS.id | Usuario que realizó búsqueda |
| query | VARCHAR(500) | NOT NULL | Criterios de búsqueda |
| sort | VARCHAR(50) | DEFAULT 'stars' | Campo de ordenamiento |
| results_count | INTEGER | DEFAULT 0 | Total de resultados |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de búsqueda |

---

### Tabla 3: SAVED_REPOSITORIES

| Campo | Tipo | Restricción | Descripción |
|-------|------|---|---|
| id | SERIAL | PRIMARY KEY | ID único del guardado |
| user_id | INTEGER | FK → USERS.id | Usuario que guardó |
| github_id | BIGINT | NOT NULL | ID del repo en GitHub |
| name | VARCHAR(255) | NOT NULL | Nombre corto repo |
| full_name | VARCHAR(255) | NOT NULL | Nombre completo (owner/repo) |
| owner | VARCHAR(255) | NOT NULL | Owner del repositorio |
| url | VARCHAR(500) | NOT NULL | URL en GitHub |
| stars | INTEGER | DEFAULT 0 | Número de stars |
| language | VARCHAR(50) | NULLABLE | Lenguaje principal |
| saved_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de guardado |

---

## SQL Scripts

### Crear tablas

```sql
-- Tabla USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Tabla SEARCH_HISTORY
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(500) NOT NULL,
    sort VARCHAR(50) DEFAULT 'stars',
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_created ON search_history(created_at);

-- Tabla SAVED_REPOSITORIES
CREATE TABLE saved_repositories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    stars INTEGER DEFAULT 0,
    language VARCHAR(50),
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, github_id)
);

CREATE INDEX idx_saved_repos_user ON saved_repositories(user_id);
```

### Insertar datos de prueba

```sql
-- Usuario
INSERT INTO users (email, hashed_password) 
VALUES ('test@example.com', '$2b$12$...');

-- Búsqueda
INSERT INTO search_history (user_id, query, sort, results_count) 
VALUES (1, 'language:python stars:>1000', 'stars', 245);

-- Repositorio guardado
INSERT INTO saved_repositories (user_id, github_id, name, full_name, owner, url, stars, language) 
VALUES (1, 123456789, 'linux', 'torvalds/linux', 'torvalds', 'https://github.com/torvalds/linux', 180000, 'C');
```

### Queries útiles

```sql
-- Obtener usuario
SELECT * FROM users WHERE email = 'test@example.com';

-- Búsquedas de un usuario
SELECT * FROM search_history WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;

-- Repos guardados de un usuario
SELECT * FROM saved_repositories WHERE user_id = 1 ORDER BY saved_at DESC;

-- Repos más guardados (globales)
SELECT github_id, full_name, COUNT(*) as save_count 
FROM saved_repositories 
GROUP BY github_id, full_name 
ORDER BY save_count DESC LIMIT 10;
```

---

## Restricciones e Integridad

- **ON DELETE CASCADE**: Si se elimina usuario, se eliminan sus búsquedas y repos guardados
- **UNIQUE(user_id, github_id)**: Un usuario no puede guardar 2 veces el mismo repo
- **Email UNIQUE**: No hay emails duplicados