export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  ownerAvatar?: string;
  description?: string;
  url: string;
  stars: number;
  forks: number;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
  topics: string[];
}

export interface SearchResponse {
  total: number;
  page: number;
  per_page: number;
  repositories: Repository[];
}

export interface SavedRepository extends Repository {
  saved_at: string;
}
