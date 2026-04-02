# SQL Scripts - GitHub Scout

## Crear todas las tablas

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

---

## Insertar datos de prueba

```sql
-- Usuario de prueba
INSERT INTO users (email, hashed_password) 
VALUES (
    'tony@n3x.com', 
    '$2b$12$K3Hs09CXS6QQYqMPYNqYz.3HH/9FpfYJH5hA4ZqMb8mQCZ5K8C7oi'
);

-- Búsquedas de prueba
INSERT INTO search_history (user_id, query, sort, results_count) 
VALUES 
    (1, 'language:python stars:>1000', 'stars', 245),
    (1, 'language:go forks:>500', 'forks', 87),
    (1, 'language:rust', 'updated', 120);

-- Repositorios guardados
INSERT INTO saved_repositories (user_id, github_id, name, full_name, owner, url, stars, language) 
VALUES 
    (1, 123456789, 'linux', 'torvalds/linux', 'torvalds', 'https://github.com/torvalds/linux', 180000, 'C'),
    (1, 987654321, 'kubernetes', 'kubernetes/kubernetes', 'kubernetes', 'https://github.com/kubernetes/kubernetes', 107000, 'Go'),
    (1, 555555555, 'rust', 'rust-lang/rust', 'rust-lang', 'https://github.com/rust-lang/rust', 95000, 'Rust');
```

---

## Consultas útiles

### Usuarios
```sql
-- Obtener usuario por email
SELECT * FROM users WHERE email = 'tony@n3x.com';

-- Contar total de usuarios
SELECT COUNT(*) as total_users FROM users;

-- Usuarios registrados en los últimos 7 días
SELECT * FROM users WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Búsquedas
```sql
-- Todas las búsquedas de un usuario
SELECT * FROM search_history WHERE user_id = 1 ORDER BY created_at DESC;

-- Últimas 10 búsquedas
SELECT * FROM search_history ORDER BY created_at DESC LIMIT 10;

-- Búsquedas más frecuentes (globales)
SELECT query, COUNT(*) as search_count 
FROM search_history 
GROUP BY query 
ORDER BY search_count DESC 
LIMIT 10;

-- Búsquedas de un usuario en los últimos 30 días
SELECT * FROM search_history 
WHERE user_id = 1 AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

### Repositorios guardados
```sql
-- Todos los repos guardados de un usuario
SELECT * FROM saved_repositories WHERE user_id = 1 ORDER BY saved_at DESC;

-- Repos más populares (más guardados)
SELECT github_id, full_name, COUNT(*) as save_count 
FROM saved_repositories 
GROUP BY github_id, full_name 
ORDER BY save_count DESC 
LIMIT 10;

-- Lenguajes favoritos entre repos guardados
SELECT language, COUNT(*) as count 
FROM saved_repositories 
WHERE user_id = 1 
GROUP BY language 
ORDER BY count DESC;

-- Repos con más de 10k stars guardados
SELECT * FROM saved_repositories 
WHERE stars > 10000 
ORDER BY stars DESC;
```

### Analíticos
```sql
-- Actividad por usuario (búsquedas + repos guardados)
SELECT 
    u.email,
    COUNT(DISTINCT sh.id) as total_searches,
    COUNT(DISTINCT sr.id) as total_saved,
    MAX(sh.created_at) as last_search,
    MAX(sr.saved_at) as last_save
FROM users u
LEFT JOIN search_history sh ON u.id = sh.user_id
LEFT JOIN saved_repositories sr ON u.id = sr.user_id
GROUP BY u.id, u.email;

-- Promedio de resultados por búsqueda
SELECT 
    AVG(results_count) as avg_results,
    MIN(results_count) as min_results,
    MAX(results_count) as max_results
FROM search_history;
```

---

## Limpiar datos (desarrollo)

```sql
-- Eliminar todas las búsquedas de un usuario
DELETE FROM search_history WHERE user_id = 1;

-- Eliminar todos los repos guardados de un usuario
DELETE FROM saved_repositories WHERE user_id = 1;

-- Eliminar un usuario (cascade eliminará sus datos)
DELETE FROM users WHERE email = 'tony@n3x.com';

-- Limpiar TODO (cuidado!)
DELETE FROM saved_repositories;
DELETE FROM search_history;
DELETE FROM users;
```

---

## Resetear secuencias (después de DELETE)

```sql
-- Resetear secuencias de IDs
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE search_history_id_seq RESTART WITH 1;
ALTER SEQUENCE saved_repositories_id_seq RESTART WITH 1;
```

---

## Ver estructura de tablas

```sql
-- Ver todas las tablas
\dt

-- Ver definición de tabla específica
\d users

-- Ver índices
\di

-- Ver relaciones (foreign keys)
\d search_history
```