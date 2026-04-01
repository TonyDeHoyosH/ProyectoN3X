export interface Repository {
    id: number;
    name: string;
    owner: string;
    stars: number;
    language: string | null;
    url: string;
    description: string | null;
}

export interface SearchResponse {
    total: number;
    repositories: Repository[];
}
