from dataclasses import dataclass, asdict, field
from datetime import datetime
from typing import Optional, Any

@dataclass
class Repository:
    name: str
    full_name: str
    owner: str
    url: str
    stars: int
    forks: int
    id: Optional[int] = None
    owner_avatar: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    topics: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert the repository object to a dictionary."""
        return asdict(self)
