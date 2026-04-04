import axios, { AxiosError, AxiosInstance } from "axios";
import { Repository, SearchResponse, SavedRepository, User } from "../types";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const detail = (error.response?.data as any)?.detail;

    if (status === 401) {
      alert('Sesión expirada. Redirigiendo a login...');
      try { await authService.logout(); } catch { /* ignore */ }
      window.location.href = '/login';
    } else if (status === 403) {
      alert('No tienes permiso para esto');
    } else if (status !== undefined && status >= 500) {
      alert('Error del servidor. Intenta más tarde.');
    } else {
      alert(detail ?? 'Error desconocido');
    }

    return Promise.reject(error);
  }
);

export const authService = {
  register: async (data: Pick<User, "email"> & { password: string }) => {
    const response = await api.post<User>("/api/auth/register", data);
    return response.data;
  },
  login: async (data: Pick<User, "email"> & { password: string }) => {
    const response = await api.post<{ message: string }>("/api/auth/login", data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post<{ message: string }>("/api/auth/logout");
    return response.data;
  },
};

export const reposService = {
  search: async (
    query: string,
    sort: string = "stars",
    per_page: number = 20,
    page: number = 1
  ) => {
    const response = await api.post<SearchResponse>("/api/repos/search", {
      query,
      sort,
      per_page,
      page,
    });
    return response.data;
  },
  getSaved: async () => {
    const response = await api.get<{ total: number; repositories: SavedRepository[] }>(
      "/api/repos/saved"
    );
    return response.data;
  },
  saveRepository: async (repo: Repository | SavedRepository) => {
    const payload = {
      github_id: repo.id,
      name: repo.name,
      // Manejo seguro por si la Data cruda del back mandó snake_case en runtime.
      full_name: repo.fullName || (repo as any).full_name,
      owner: repo.owner,
      url: repo.url,
      stars: repo.stars,
      language: repo.language,
    };
    const response = await api.post<{ id: number; message: string }>("/api/repos/save", payload);
    return response.data;
  },
  deleteRepository: async (repoId: number) => {
    const response = await api.delete(`/api/repos/saved/${repoId}`);
    return response.data;
  },
};
