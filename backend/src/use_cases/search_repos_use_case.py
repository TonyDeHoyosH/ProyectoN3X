from typing import Any
from src.infrastructure.github_client import GitHubClient
from src.infrastructure.parsers import RepositoryParser

class SearchReposUseCase:
    
    def __init__(self, github_client: GitHubClient):
        self.github_client = github_client

    async def execute(
        self, query: str, sort: str = "stars", per_page: int = 30, page: int = 1
    ) -> tuple[int, list[dict[str, Any]], str]:
        
        if not query:
            return 0, [], "Query cannot be empty"

        try:
            response = await self.github_client.search_repositories(
                query=query, sort=sort, per_page=per_page, page=page
            )
            total, repos = RepositoryParser.parse_search_response(response)
            
            repos_dict = [repo.to_dict() for repo in repos]
            return total, repos_dict, ""
        except Exception as e:
            return 0, [], f"Error querying GitHub API: {str(e)}"
