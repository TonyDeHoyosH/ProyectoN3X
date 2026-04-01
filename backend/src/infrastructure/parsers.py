from src.domain.repository import Repository

class RepositoryParser:
    @staticmethod
    def parse_repository(item: dict) -> Repository:
        return Repository(
            id=item["id"],
            name=item["name"],
            owner=item["owner"]["login"],
            stars=item["stargazers_count"],
            language=item.get("language"),
            url=item["html_url"],
            description=item.get("description")
        )

    @staticmethod
    def parse_search_response(raw: dict) -> dict:
        items = raw.get("items", [])
        return {
            "total": raw.get("total_count", 0),
            "repositories": [RepositoryParser.parse_repository(item) for item in items]
        }
