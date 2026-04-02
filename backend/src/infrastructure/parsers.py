from datetime import datetime
from typing import Any, Tuple, List
from src.domain.repository import Repository

class RepositoryParser:
    
    @staticmethod
    def parse_repository(item: dict[str, Any]) -> Repository:
        """Parse a single repository dictionary from GitHub API to a Domain Entity."""
        
        def parse_date(date_str: str) -> datetime | None:
            if not date_str:
                return None
            try:
                # GitHub returns ISO8601 like: "2011-01-26T19:01:12Z"
                return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            except (ValueError, TypeError):
                return None

        return Repository(
            id=item.get("id"),
            name=item.get("name", ""),
            full_name=item.get("full_name", ""),
            owner=item.get("owner", {}).get("login", ""),
            owner_avatar=item.get("owner", {}).get("avatar_url"),
            description=item.get("description"),
            url=item.get("html_url", ""),
            stars=item.get("stargazers_count", 0),
            forks=item.get("forks_count", 0),
            language=item.get("language"),
            created_at=parse_date(item.get("created_at", "")),
            updated_at=parse_date(item.get("updated_at", "")),
            topics=item.get("topics", [])
        )

    @staticmethod
    def parse_search_response(response: dict[str, Any]) -> tuple[int, list[Repository]]:
        """Parse a full GitHub search response into a total count and list of Domain Entities."""
        total_count = response.get("total_count", 0)
        items = response.get("items", [])
        
        repos = [RepositoryParser.parse_repository(item) for item in items]
        return total_count, repos
