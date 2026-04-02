# GitHub Scout

Aplicación interactiva diseñada para la búsqueda, exploración y almacenamiento de repositorios favoritos integrándose directamente con la API de GitHub.

## Stack 
- **Backend:** FastAPI, Python, SQLAlchemy (asyncpg)
- **Frontend:** React (Vite), TypeScript, React Router
- **Base de Datos:** PostgreSQL
- **Orquestación:** Docker Compose

## Requisitos
- Docker Desktop

## Inicio rápido

Para inicializar todo el clúster local, ejecuta:
```bash
docker-compose up -d --build
```

Una vez desplegado el entorno, podrás acceder a:
- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

Si deseas detener todos los contenedores y liberar recursos:
```bash
docker-compose down
```

## Estructura
- `/backend`: Lógica de integración, base de datos y endpoints con FastAPI
- `/frontend`: UI diseñada en React y Vite
- `/docs`: Documentación arquitectónica completa y diseño de sistemas
