from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.github_client import GitHubClient
from src.infrastructure.parsers import RepositoryParser
from src.infrastructure.db import SearchHistoryModel


class SearchReposUseCase:

    def __init__(self, github_client: GitHubClient):
        self.github_client = github_client

    async def execute(
        self,
        query: str,
        sort: str = "stars",
        per_page: int = 30,
        page: int = 1,
        user_id: int | None = None,
        db: AsyncSession | None = None,
    ) -> tuple[int, list[dict[str, Any]], str]:

        if not query:
            return 0, [], "Query cannot be empty"

        try:
            response = await self.github_client.search_repositories(
                query=query, sort=sort, per_page=per_page, page=page
            )
            total, repos = RepositoryParser.parse_search_response(response)
            repos_dict = [repo.to_dict() for repo in repos]
        except Exception as e:
            return 0, [], f"Error querying GitHub API: {str(e)}"

        if user_id is not None and db is not None:
            try:
                record = SearchHistoryModel(
                    user_id=user_id,
                    query=query,
                    sort=sort,
                    results_count=total,
                )
                db.add(record)
                await db.commit()
            except Exception:
                await db.rollback()

        return total, repos_dict, ""
