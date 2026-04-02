import pytest
import asyncio
from unittest.mock import AsyncMock
from src.infrastructure.parsers import RepositoryParser
from src.use_cases.search_repos_use_case import SearchReposUseCase
from src.infrastructure.github_client import GitHubClient

def test_parse_repository():
    mock_item = {
        "id": 123,
        "name": "test-repo",
        "full_name": "owner/test-repo",
        "owner": {"login": "owner", "avatar_url": "url"},
        "html_url": "http://github.com",
        "stargazers_count": 10,
        "forks_count": 5,
        "language": "Python"
    }
    repo = RepositoryParser.parse_repository(mock_item)
    assert repo.id == 123
    assert repo.name == "test-repo"
    assert repo.stars == 10
    assert repo.language == "Python"

def test_parse_search_response():
    mock_response = {
        "total_count": 1,
        "items": [
            {
                "id": 1,
                "name": "repo1",
                "owner": {"login": "user1"}
            }
        ]
    }
    total, repos = RepositoryParser.parse_search_response(mock_response)
    assert total == 1
    assert len(repos) == 1
    assert repos[0].name == "repo1"

@pytest.mark.asyncio
async def test_search_repos_use_case():
    mock_client = AsyncMock(spec=GitHubClient)
    mock_client.search_repositories.return_value = {
        "total_count": 2,
        "items": [
            {"id": 1, "name": "r1", "stargazers_count": 5},
            {"id": 2, "name": "r2", "stargazers_count": 3}
        ]
    }
    
    use_case = SearchReposUseCase(mock_client)
    total, repos, error = await use_case.execute(query="test", per_page=2)
    
    assert error == ""
    assert total == 2
    assert len(repos) == 2
    assert repos[0]["name"] == "r1"
    mock_client.search_repositories.assert_called_once_with(query="test", sort="stars", per_page=2, page=1)
