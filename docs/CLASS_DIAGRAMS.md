# Diagrama de Clases - GitHub Scout

## Estructura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOMAIN LAYER                             │
│                   (Entidades de negocio)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐      ┌──────────────────────┐          │
│  │      User          │      │   Repository         │          │
│  ├────────────────────┤      ├──────────────────────┤          │
│  │ - id: int          │      │ - id: int            │          │
│  │ - email: str       │      │ - name: str          │          │
│  │ - password: str    │      │ - full_name: str     │          │
│  │ - created_at: date │      │ - owner: str         │          │
│  │                    │      │ - owner_avatar: str  │          │
│  │ + validate()       │      │ - description: str   │          │
│  │ + to_dict()        │      │ - url: str           │          │
│  └────────────────────┘      │ - stars: int         │          │
│                              │ - forks: int         │          │
│                              │ - language: str      │          │
│                              │ - created_at: date   │          │
│                              │ - updated_at: date   │          │
│                              │ - topics: list       │          │
│                              │                      │          │
│                              │ + to_dict()          │          │
│                              └──────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    USE CASES LAYER                              │
│              (Lógica de negocio / Servicios)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐                               │
│  │   AuthUseCase               │                               │
│  ├─────────────────────────────┤                               │
│  │ + validate_password()       │                               │
│  │ + hash_password()           │                               │
│  │ + verify_password()         │                               │
│  │ + create_access_token()     │                               │
│  │ + verify_token()            │                               │
│  │ + register()                │                               │
│  │ + login()                   │                               │
│  └─────────────────────────────┘                               │
│                                                                 │
│  ┌─────────────────────────────┐                               │
│  │ SearchReposUseCase          │                               │
│  ├─────────────────────────────┤                               │
│  │ - github_client             │                               │
│  │                             │                               │
│  │ + execute(query, sort...)   │                               │
│  │ + returns (total, repos)    │                               │
│  └─────────────────────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               INFRASTRUCTURE LAYER                              │
│         (Acceso a datos y recursos externos)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐   ┌──────────────────────────┐   │
│  │   DatabaseConnection     │   │   GitHubClient           │   │
│  ├──────────────────────────┤   ├──────────────────────────┤   │
│  │ - engine: AsyncEngine    │   │ - base_url: str          │   │
│  │ - session_factory        │   │ - client: httpx.Client   │   │
│  │                          │   │                          │   │
│  │ + get_session()          │   │ + search_repositories()  │   │
│  │ + create_tables()        │   │ + close()                │   │
│  └──────────────────────────┘   └──────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────┐                                  │
│  │   RepositoryParser       │                                  │
│  ├──────────────────────────┤                                  │
│  │ + parse_repository()     │                                  │
│  │ + parse_search_response()│                                  │
│  └──────────────────────────┘                                  │
│                                                                 │
│  ┌──────────────────────────┐                                  │
│  │   UserModel (SQLAlchemy) │                                  │
│  ├──────────────────────────┤                                  │
│  │ - id: int (PK)           │                                  │
│  │ - email: str (UNIQUE)    │                                  │
│  │ - hashed_password: str   │                                  │
│  │ - created_at: datetime   │                                  │
│  └──────────────────────────┘                                  │
│                                                                 │
│  ┌──────────────────────────┐                                  │
│  │ SearchHistoryModel       │                                  │
│  ├──────────────────────────┤                                  │
│  │ - id: int (PK)           │                                  │
│  │ - user_id: int (FK)      │                                  │
│  │ - query: str             │                                  │
│  │ - sort: str              │                                  │
│  │ - results_count: int     │                                  │
│  │ - created_at: datetime   │                                  │
│  └──────────────────────────┘                                  │
│                                                                 │
│  ┌──────────────────────────┐                                  │
│  │ SavedRepositoryModel     │                                  │
│  ├──────────────────────────┤                                  │
│  │ - id: int (PK)           │                                  │
│  │ - user_id: int (FK)      │                                  │
│  │ - github_id: bigint      │                                  │
│  │ - name: str              │                                  │
│  │ - full_name: str         │                                  │
│  │ - owner: str             │                                  │
│  │ - url: str               │                                  │
│  │ - stars: int             │                                  │
│  │ - language: str          │                                  │
│  │ - saved_at: datetime     │                                  │
│  └──────────────────────────┘                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                  │
│                 (Rutas y Endpoints)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐   ┌──────────────────────────┐   │
│  │   auth.router            │   │ repositories.router      │   │
│  ├──────────────────────────┤   ├──────────────────────────┤   │
│  │ POST /register           │   │ POST /search             │   │
│  │ POST /login              │   │ GET /saved               │   │
│  │ POST /logout             │   │ POST /save               │   │
│  │                          │   │ DELETE /saved/{id}       │   │
│  └──────────────────────────┘   └──────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                               │
│               (Seguridad y Validación)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐   ┌──────────────────────────┐   │
│  │   AuthMiddleware         │   │ ValidationMiddleware     │   │
│  ├──────────────────────────┤   ├──────────────────────────┤   │
│  │ + get_current_user()     │   │ - RegisterRequest        │   │
│  │ + verify_jwt()           │   │ - LoginRequest           │   │
│  │                          │   │ - SearchQuery            │   │
│  └──────────────────────────┘   │ - SaveRepositoryRequest  │   │
│                                  │                          │   │
│                                  │ + Pydantic validation    │   │
│                                  └──────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detalle de Clases Principales

### 1. DOMAIN - User

```python
@dataclass
class User:
    """Domain Entity: Usuario del sistema"""
    
    id: Optional[int]
    email: str
    password: str  # Nunca almacenado, solo en memoria temporal
    created_at: Optional[datetime]
    
    def validate(self) -> bool:
        """Valida que el usuario sea válido"""
        return self.email and self.password
    
    def to_dict(self) -> dict:
        """Convierte a diccionario para JSON"""
        return {
            "id": self.id,
            "email": self.email,
            "created_at": self.created_at.isoformat()
        }
```

---

### 2. DOMAIN - Repository

```python
@dataclass
class Repository:
    """Domain Entity: Repositorio de GitHub"""
    
    id: int  # github_id
    name: str
    full_name: str  # owner/name
    owner: str
    owner_avatar: str
    description: Optional[str]
    url: str  # github.com/...
    stars: int
    forks: int
    language: Optional[str]
    created_at: str
    updated_at: str
    topics: list[str]
    
    def to_dict(self) -> dict:
        """Convierte a diccionario para JSON"""
        return {
            "id": self.id,
            "name": self.name,
            "fullName": self.full_name,
            "owner": self.owner,
            "ownerAvatar": self.owner_avatar,
            "description": self.description,
            "url": self.url,
            "stars": self.stars,
            "forks": self.forks,
            "language": self.language,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
            "topics": self.topics
        }
```

---

### 3. USE CASES - AuthUseCase

```python
class AuthUseCase:
    """Use Case: Autenticación de usuarios"""
    
    @staticmethod
    def validate_password(password: str) -> bool:
        """Valida que password sea válido (6+ chars, hexadecimal)"""
        if len(password) < 6:
            return False
        try:
            int(password, 16)  # Intenta parsear como hex
            return True
        except ValueError:
            return False
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hashea password con bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        """Verifica password contra hash"""
        return pwd_context.verify(plain, hashed)
    
    @staticmethod
    def create_access_token(user_id: int) -> str:
        """Genera JWT token"""
        payload = {
            "sub": str(user_id),
            "exp": datetime.utcnow() + timedelta(days=1)
        }
        return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    
    @staticmethod
    def verify_token(token: str) -> Optional[int]:
        """Verifica y extrae user_id del token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return int(payload.get("sub"))
        except JWTError:
            return None
    
    @staticmethod
    async def register(db: Session, email: str, password: str) -> tuple[User, str]:
        """Registra nuevo usuario"""
        # Validar
        if not AuthUseCase.validate_password(password):
            return None, "Password inválido"
        
        # Verificar duplicado
        existing = await db.query(UserModel).filter(...).first()
        if existing:
            return None, "Email ya existe"
        
        # Crear
        hashed = AuthUseCase.hash_password(password)
        user = UserModel(email=email, hashed_password=hashed)
        db.add(user)
        await db.commit()
        
        return User(id=user.id, email=user.email), ""
    
    @staticmethod
    async def login(db: Session, email: str, password: str) -> tuple[str, str]:
        """Login y retorna JWT"""
        user = await db.query(UserModel).filter(...).first()
        
        if not user or not AuthUseCase.verify_password(password, user.hashed_password):
            return None, "Credenciales inválidas"
        
        token = AuthUseCase.create_access_token(user.id)
        return token, ""
```

---

### 4. USE CASES - SearchReposUseCase

```python
class SearchReposUseCase:
    """Use Case: Buscar repositorios en GitHub"""
    
    def __init__(self, github_client: GitHubClient):
        self.github_client = github_client
    
    async def execute(
        self,
        query: str,
        sort: str = "stars",
        per_page: int = 20,
        page: int = 1
    ) -> tuple[int, list[dict], str]:
        """
        Busca repositorios
        
        Returns: (total_count, repositories, error_message)
        """
        try:
            # Llamar a GitHub API
            response = await self.github_client.search_repositories(
                query=query,
                sort=sort,
                per_page=per_page,
                page=page
            )
            
            # Parsear respuesta
            total, repos = RepositoryParser.parse_search_response(response)
            
            # Convertir a dict
            repos_dict = [r.to_dict() for r in repos]
            
            return total, repos_dict, ""
        
        except Exception as e:
            return 0, [], f"Error: {str(e)}"
```

---

### 5. INFRASTRUCTURE - GitHubClient

```python
class GitHubClient:
    """Client para consumir GitHub API"""
    
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.client = httpx.AsyncClient(timeout=10.0)
    
    async def search_repositories(
        self,
        query: str,
        sort: str = "stars",
        per_page: int = 30,
        page: int = 1
    ) -> dict:
        """
        Busca repositorios
        
        Args:
            query: "language:python stars:>1000"
            sort: "stars" | "forks" | "updated"
            per_page: 1-100
            page: >= 1
        
        Returns: GitHub API response JSON
        """
        url = f"{self.base_url}/search/repositories"
        
        params = {
            "q": query,
            "sort": sort,
            "per_page": min(per_page, 100),
            "page": page,
            "order": "desc"
        }
        
        response = await self.client.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    async def close(self):
        """Cierra conexión"""
        await self.client.aclose()
```

---

### 6. INFRASTRUCTURE - RepositoryParser

```python
class RepositoryParser:
    """Parser: Extrae datos relevantes de GitHub API"""
    
    @staticmethod
    def parse_repository(item: dict) -> Repository:
        """
        Convierte item de GitHub API a Repository domain entity
        
        Filtra solo los datos clave, descarta el resto.
        """
        return Repository(
            id=item.get("id"),
            name=item.get("name", ""),
            full_name=item.get("full_name", ""),
            owner=item.get("owner", {}).get("login", ""),
            owner_avatar=item.get("owner", {}).get("avatar_url", ""),
            description=item.get("description"),
            url=item.get("html_url", ""),
            stars=item.get("stargazers_count", 0),
            forks=item.get("forks_count", 0),
            language=item.get("language"),
            created_at=item.get("created_at", ""),
            updated_at=item.get("updated_at", ""),
            topics=item.get("topics", [])
        )
    
    @staticmethod
    def parse_search_response(response: dict) -> tuple[int, list[Repository]]:
        """
        Parsea respuesta completa de búsqueda
        
        Returns: (total_count, list_of_repositories)
        """
        total = response.get("total_count", 0)
        items = response.get("items", [])
        
        repositories = [
            RepositoryParser.parse_repository(item)
            for item in items
        ]
        
        return total, repositories
```

---

### 7. DATABASE MODELS

```python
class UserModel(Base):
    """SQLAlchemy Model: Usuarios"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchHistoryModel(Base):
    """SQLAlchemy Model: Historial de búsquedas"""
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    query = Column(String(500), nullable=False)
    sort = Column(String(50), default="stars")
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class SavedRepositoryModel(Base):
    """SQLAlchemy Model: Repositorios guardados"""
    __tablename__ = "saved_repositories"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    github_id = Column(BigInteger, nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    owner = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    stars = Column(Integer, default=0)
    language = Column(String(50))
    saved_at = Column(DateTime, default=datetime.utcnow)
```

---

### 8. PYDANTIC VALIDATION MODELS

```python
class RegisterRequest(BaseModel):
    """Validación: Registro de usuario"""
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    """Validación: Login de usuario"""
    email: EmailStr
    password: str

class SearchQuery(BaseModel):
    """Validación: Búsqueda de repositorios"""
    query: str
    sort: str = "stars"
    per_page: int = 20
    page: int = 1
    
    @field_validator("per_page")
    @classmethod
    def validate_per_page(cls, v):
        if v < 1 or v > 100:
            raise ValueError("per_page entre 1 y 100")
        return v

class SaveRepositoryRequest(BaseModel):
    """Validación: Guardar repositorio"""
    github_id: int
    name: str
    full_name: str
    owner: str
    url: str
    stars: int
    language: Optional[str]
```

---

## Relaciones entre Clases

```
┌─────────────┐
│    User     │────────1:N──────┬──────────────────┐
└─────────────┘                 │                  │
                                ▼                  ▼
                    ┌──────────────────┐  ┌──────────────────┐
                    │ SearchHistory    │  │ SavedRepository  │
                    └──────────────────┘  └──────────────────┘

AuthUseCase → User (registro, login)
SearchReposUseCase → Repository (búsqueda)
GitHubClient → Repository (fetch de GitHub)
RepositoryParser → Repository (parseo)
```

---

## Flujo de Clases en un Request

```
HTTP Request → FastAPI Route → Middleware (Auth) → Use Case → Infrastructure

Ejemplo: POST /api/repos/search

1. Request llega con JWT en cookie
2. AuthMiddleware extrae JWT → user_id
3. Route recibe user_id como dependency
4. SearchReposUseCase.execute() es llamado
5. GitHubClient.search_repositories() consulta GitHub
6. RepositoryParser parsea respuesta
7. Repository objects creados
8. Repository.to_dict() para JSON
9. Response retorna al frontend

Clases involucradas:
- Middleware (auth)
- SearchReposUseCase
- GitHubClient
- RepositoryParser
- Repository (domain)
- UserModel (verificación JWT)
```