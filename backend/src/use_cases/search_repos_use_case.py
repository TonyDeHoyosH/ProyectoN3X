from src.infrastructure.github_client import search_repositories
from src.infrastructure.parsers import RepositoryParser

class SearchReposUseCase:
    @staticmethod
    async def execute(query: str, sort: str = "stars", per_page: int = 10, page: int = 1):
        raw_data = await search_repositories(query, sort, per_page, page)
        return RepositoryParser.parse_search_response(raw_data)
