import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks';
import { reposService } from '../services/api';
import { Repository } from '../types';
import RepositoryCard from './RepositoryCard';
import Pagination from './Pagination';

const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('stars');
    const [page, setPage] = useState(1);
    const [perPage] = useState(20);
    const [repos, setRepos] = useState<Repository[]>([]);
    const [total, setTotal] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    // New states
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSavingRepos, setIsSavingRepos] = useState(false);
    const [savedRepoIds, setSavedRepoIds] = useState<Set<number>>(new Set());

    // Load saved repos on mount
    useEffect(() => {
        reposService.getSaved()
            .then(({ repositories }) =>
                setSavedRepoIds(new Set(repositories.map((r) => r.id)))
            )
            .catch(() => {});
    }, []);

    const search = useCallback(async (searchPage: number) => {
        if (!query.trim()) return;
        setIsSearching(true);
        setSearchError(null);
        setHasSearched(true);

        try {
            const data = await reposService.search(query, sort, perPage, searchPage);
            setRepos(data.repositories);
            setTotal(data.total);
            setPage(searchPage);
        } catch (error: any) {
            const msg = error?.response?.data?.detail ?? 'Error al buscar repositorios.';
            setSearchError(msg);
            setRepos([]);
            setTotal(0);
        } finally {
            setIsSearching(false);
        }
    }, [query, sort, perPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        search(1);
    };

    const handleSave = useCallback(async (repo: Repository) => {
        setIsSavingRepos(true);
        try {
            const { id } = await reposService.saveRepository(repo);
            setSavedRepoIds((prev) => new Set(prev).add(id));
        } finally {
            setIsSavingRepos(false);
        }
    }, []);

    const handleDelete = useCallback(async (repoId: number) => {
        setIsSavingRepos(true);
        try {
            await reposService.deleteRepository(repoId);
            setSavedRepoIds((prev) => {
                const next = new Set(prev);
                next.delete(repoId);
                return next;
            });
        } finally {
            setIsSavingRepos(false);
        }
    }, []);

    const totalPages = Math.ceil(total / perPage);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h2 className="logo">GitHub Scout</h2>
                <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
            </header>

            <form onSubmit={handleSearch} className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar repositorios..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
                    <option value="stars">Stars</option>
                    <option value="forks">Forks</option>
                    <option value="updated">Updated</option>
                </select>
                <button type="submit" disabled={isSearching || !query.trim()} className="search-btn">
                    {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            <main className="dashboard-content">
                {/* Error */}
                {searchError && (
                    <div style={{
                        background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5',
                        borderRadius: '6px', padding: '12px 16px', marginBottom: '16px',
                    }}>
                        ⚠️ {searchError}
                    </div>
                )}

                {/* Loading skeleton */}
                {isSearching && (
                    <p className="status-message" style={{ opacity: 0.6 }}>⏳ Cargando repositorios...</p>
                )}

                {/* Empty state */}
                {!isSearching && hasSearched && repos.length === 0 && !searchError && (
                    <p className="status-message">
                        No se encontraron repositorios. Intenta con otros criterios.
                    </p>
                )}

                {/* Results */}
                {!isSearching && repos.length > 0 && (
                    <div className="repos-grid">
                        {repos.map((repo) => (
                            <RepositoryCard
                                key={repo.id}
                                repo={repo}
                                isSaved={savedRepoIds.has(repo.id)}
                                isSaving={isSavingRepos}
                                onSave={() => handleSave(repo)}
                                onDelete={() => handleDelete(repo.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {total > 0 && !isSearching && (
                    <div style={{ marginTop: '24px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={(p) => search(p)}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
