import httpx
from typing import Any

class GitHubClient:
    BASE_URL = "https://api.github.com"

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=10.0, base_url=self.BASE_URL)

    async def search_repositories(
        self, query: str, sort: str = "stars", per_page: int = 30, page: int = 1
    ) -> dict[str, Any]:
        """Search repositories using GitHub Search API."""
        params = {"q": query, "sort": sort, "per_page": per_page, "page": page}
        try:
            response = await self.client.get("/search/repositories", params=params)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise RuntimeError("GitHub API timeout (>10s)")
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            if status == 403:
                raise RuntimeError("Rate limit excedido")
            if status >= 500:
                raise RuntimeError("GitHub API no disponible")
            raise RuntimeError(f"Error consultando GitHub API ({status})")
        except Exception:
            raise RuntimeError("Error consultando GitHub API")

    async def close(self) -> None:
        """Close the async HTTP client."""
        await self.client.aclose()
