# Casos de Uso - GitHub Scout

## 1. Registrar Usuario

### Descripción
Usuario nuevo se registra en el sistema con email y contraseña.

### Actores
- **Usuario no autenticado**

### Precondiciones
- Usuario accede a página de registro
- Email no existe en el sistema

### Flujo Principal
1. Usuario ingresa email
2. Usuario ingresa contraseña (mínimo 6 caracteres, solo hexadecimal)
3. Sistema valida formato de email
4. Sistema valida contraseña
5. Sistema verifica que email no exista
6. Sistema hashea contraseña con bcrypt
7. Sistema crea registro en tabla USERS
8. Sistema retorna mensaje de éxito
9. Usuario es redirigido a login

### Flujo Alternativo (Email ya existe)
1. Sistema detecta email duplicado
2. Sistema retorna error: "Email ya registrado"
3. Usuario intenta con otro email

### Flujo Alternativo (Contraseña inválida)
1. Sistema valida contraseña
2. Falla validación (< 6 chars o no hexadecimal)
3. Sistema retorna error específico
4. Usuario corrige y reintenta

### Postcondiciones
- Usuario registrado en BD
- Contraseña almacenada hasheada
- Usuario puede hacer login

### Datos almacenados
```
Tabla: users
- id (auto)
- email
- hashed_password
- created_at (actual)
```

---

## 2. Autenticarse (Login)

### Descripción
Usuario se autentica con email y contraseña, recibe JWT en cookie.

### Actores
- **Usuario registrado**

### Precondiciones
- Usuario existe en BD
- Usuario está en página de login
- Contraseña es correcta

### Flujo Principal
1. Usuario ingresa email
2. Usuario ingresa contraseña
3. Sistema busca usuario por email en tabla USERS
4. Sistema verifica password vs hash almacenado (bcrypt)
5. Sistema genera JWT token con user_id
6. Sistema setea cookie HttpOnly con JWT
7. Sistema retorna status 200
8. Frontend recibe cookie automáticamente
9. Usuario es redirigido a dashboard

### Flujo Alternativo (Email no existe)
1. Sistema busca email en BD
2. Email no encontrado
3. Sistema retorna error: "Email o contraseña incorrectos"
4. Usuario intenta de nuevo

### Flujo Alternativo (Contraseña incorrecta)
1. Sistema encuentra usuario
2. Verifica password vs hash
3. Password no coincide
4. Sistema retorna error: "Email o contraseña incorrectos"
5. Usuario intenta de nuevo

### Postcondiciones
- Cookie HttpOnly con JWT setead en navegador
- Usuario autenticado en sesión
- Acceso a dashboard permitido

### Datos utilizados
```
Tabla: users
Lectura: email, hashed_password
Generado: JWT token con { sub: user_id, exp: datetime }
Almacenado: Cookie access_token (HttpOnly)
```

---

## 3. Buscar Repositorios en GitHub

### Descripción
Usuario autenticado busca repositorios en GitHub con criterios específicos.

### Actores
- **Usuario autenticado**

### Precondiciones
- Usuario está logueado (tiene JWT válido)
- User accede a dashboard
- GitHub API está disponible

### Flujo Principal
1. Usuario ingresa criterios de búsqueda:
   - Query (ej: "language:python stars:>1000")
   - Sort (stars, forks, updated)
   - Per page (1-100)
   - Página (1, 2, 3...)
2. Frontend valida input
3. Frontend envía POST a `/api/repos/search` con JWT en cookie
4. Backend verifica JWT (extrae user_id)
5. Backend valida parámetros con Pydantic
6. Backend consulta GitHub API con query
7. Backend recibe respuesta JSON de GitHub
8. Backend parsea respuesta (extrae solo datos relevantes):
   - id, name, full_name, owner, avatar
   - description, url, stars, forks
   - language, created_at, updated_at, topics
9. Backend retorna JSON al frontend:
   ```json
   {
     "total": 245,
     "page": 1,
     "per_page": 20,
     "repositories": [...]
   }
   ```
10. Frontend renderiza lista de repositorios
11. Usuario ve resultados paginados

### Flujo Alternativo (Query vacío)
1. Frontend detecta query vacío
2. Frontend muestra validación de error
3. Búsqueda no se envía

### Flujo Alternativo (GitHub API no disponible)
1. Backend intenta conectar a GitHub
2. GitHub API retorna error (5xx o timeout)
3. Backend captura excepción
4. Backend retorna error: "Error consultando GitHub API"
5. Usuario ve mensaje de error

### Flujo Alternativo (JWT expirado)
1. Frontend envía JWT en cookie
2. Backend verifica JWT
3. JWT está expirado o inválido
4. Backend retorna 401 Unauthorized
5. Frontend intercepta 401
6. Frontend redirige a login

### Postcondiciones
- Búsqueda registrada en BD (tabla search_history)
- Usuario ve resultados
- Puede guardar repos de interés

### Datos almacenados
```
Tabla: search_history
- id (auto)
- user_id (from JWT)
- query (criterios de búsqueda)
- sort (campo ordenamiento)
- results_count (total encontrado)
- created_at (actual)

Nota: Resultados NO se guardan en BD, se obtienen en tiempo real
```

---

## 4. Guardar Repositorio Favorito

### Descripción
Usuario guarda un repositorio de interés para consultarlo después.

### Actores
- **Usuario autenticado**

### Precondiciones
- Usuario está logueado
- Usuario vio resultados de búsqueda
- Repositorio existe en GitHub

### Flujo Principal
1. Usuario hace click en botón "Guardar" en repo card
2. Frontend envía POST a `/api/repos/save` con:
   - JWT en cookie
   - Datos del repositorio (github_id, name, full_name, owner, url, stars, language)
3. Backend verifica JWT (extrae user_id)
4. Backend valida que github_id no sea duplicado para este usuario
5. Backend crea registro en tabla SAVED_REPOSITORIES
6. Backend retorna status 201
7. Frontend muestra feedback: "Repositorio guardado"
8. Botón cambia a "Ya guardado" (deshabilitado)

### Flujo Alternativo (Repo ya guardado)
1. Backend detecta UNIQUE constraint violation
2. Backend retorna error 409: "Ya guardaste este repositorio"
3. Frontend muestra mensaje

### Flujo Alternativo (Error en BD)
1. Backend intenta insertar en BD
2. BD retorna error (conexión, etc)
3. Backend retorna 500
4. Frontend muestra: "Error al guardar"

### Postcondiciones
- Repositorio almacenado en SAVED_REPOSITORIES
- Usuario puede verlo en "Mis repositorios"
- Asociado con user_id

### Datos almacenados
```
Tabla: saved_repositories
- id (auto)
- user_id (from JWT)
- github_id (del repo)
- name, full_name, owner, url
- stars, language
- saved_at (actual)
```

---

## 5. Ver Repositorios Guardados

### Descripción
Usuario ve lista de todos sus repositorios guardados.

### Actores
- **Usuario autenticado**

### Precondiciones
- Usuario está logueado
- Usuario tiene acceso a sección "Mis repositorios"
- Usuario ha guardado al menos 1 repo

### Flujo Principal
1. Usuario navega a "Mis repositorios"
2. Frontend envía GET a `/api/repos/saved` con JWT
3. Backend verifica JWT (extrae user_id)
4. Backend consulta SAVED_REPOSITORIES WHERE user_id = user_id
5. Backend retorna lista de repos:
   ```json
   {
     "total": 15,
     "repositories": [...]
   }
   ```
6. Frontend renderiza lista con cards
7. Usuario ve todos sus repos guardados ordenados por fecha

### Flujo Alternativo (Sin repos guardados)
1. Backend retorna lista vacía
2. Frontend muestra mensaje: "No has guardado repos aún"
3. Botón para ir a buscar

### Postcondiciones
- Usuario ve sus repos guardados
- Puede ver detalles de cada uno
- Puede eliminar si lo desea

### Datos consultados
```
Tabla: saved_repositories
Lectura: WHERE user_id = user_id
Retorna: todos los registros del usuario
```

---

## 6. Eliminar Repositorio Guardado

### Descripción
Usuario elimina un repositorio de sus favoritos.

### Actores
- **Usuario autenticado**

### Precondiciones
- Usuario está logueado
- Usuario está viendo sus repos guardados
- Repositorio existe

### Flujo Principal
1. Usuario ve lista de repos guardados
2. Usuario hace click en botón "Eliminar" o icono de X
3. Frontend muestra confirmación: "¿Eliminar este repo?"
4. Usuario confirma
5. Frontend envía DELETE a `/api/repos/saved/{repo_id}` con JWT
6. Backend verifica JWT (extrae user_id)
7. Backend verifica que repo_id pertenezca a user_id
8. Backend elimina de SAVED_REPOSITORIES
9. Backend retorna 204 No Content
10. Frontend remueve repo de la lista
11. Usuario ve confirmación: "Repositorio eliminado"

### Flujo Alternativo (Repo no pertenece al usuario)
1. Backend verifica que repo_id pertenezca a user_id
2. No coincide
3. Backend retorna 403 Forbidden
4. Frontend muestra: "No tienes permisos"

### Flujo Alternativo (Repo no existe)
1. Backend busca repo_id
2. No encuentra registro
3. Backend retorna 404 Not Found

### Postcondiciones
- Registro eliminado de BD
- Repo ya no aparece en lista del usuario

---

## 7. Cerrar Sesión (Logout)

### Descripción
Usuario cierra sesión y elimina su JWT.

### Actores
- **Usuario autenticado**

### Precondiciones
- Usuario está logueado (tiene cookie con JWT)

### Flujo Principal
1. Usuario hace click en botón "Logout"
2. Frontend envía POST a `/api/auth/logout`
3. Backend elimina cookie (set-cookie con max_age=0)
4. Backend retorna status 200
5. Frontend limpia estado local (si hay)
6. Frontend redirige a página de login
7. Usuario sesión terminada

### Postcondiciones
- Cookie JWT eliminada
- Usuario no autenticado
- Debe hacer login nuevamente para acceder

---

## Resumen de Flujos

| Caso de Uso | Requiere Auth | Afecta BD | Externo |
|---|---|---|---|
| 1. Registrar | No | Sí (users) | No |
| 2. Login | No | No | No |
| 3. Buscar Repos | Sí | Sí (search_history) | Sí (GitHub) |
| 4. Guardar Repo | Sí | Sí (saved_repos) | No |
| 5. Ver Guardados | Sí | No (lectura) | No |
| 6. Eliminar Guardado | Sí | Sí (delete) | No |
| 7. Logout | Sí | No | No |

---

## Validaciones Comunes

### Email
- Formato válido (RFC 5322)
- Único en BD
- Requerido

### Password
- Mínimo 6 caracteres
- Solo hexadecimal (0-9, a-f)
- Requerido
- Nunca se envía en texto plano (HTTPS)

### Query de búsqueda
- No vacío
- Mínimo 1 carácter
- Máximo 500 caracteres

### Paginación
- Per page: 1-100 (default 20)
- Page: >= 1

### JWT
- Verificado en cada request protegido
- Incluido en cookie HttpOnly
- Nunca en localStorage