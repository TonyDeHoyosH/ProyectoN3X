from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Optional, Any

@dataclass
class User:
    email: str
    password: str
    id: Optional[int] = None
    created_at: Optional[datetime] = None

    def validate(self) -> bool:
        """Simple validation check for the user."""
        return bool(self.email and "@" in self.email and self.password)

    def to_dict(self) -> dict[str, Any]:
        """Convert the user object to a dictionary."""
        return asdict(self)
