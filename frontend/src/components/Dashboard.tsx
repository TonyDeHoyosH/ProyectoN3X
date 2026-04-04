import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../hooks';
import { reposService } from '../services/api';
import { Repository, SavedRepository } from '../types';
import RepositoryCard from './RepositoryCard';
import Pagination from './Pagination';
import EmptyState from './EmptyState';

const SAVED_PER_PAGE = 6;

const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const searchBarRef = useRef<HTMLFormElement>(null);

    // Search state
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('stars');
    const [page, setPage] = useState(1);
    const [perPage] = useState(20);
    const [repos, setRepos] = useState<Repository[]>([]);
    const [total, setTotal] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Save state
    const [isSavingRepos, setIsSavingRepos] = useState(false);
    const [savedRepoIds, setSavedRepoIds] = useState<Set<number>>(new Set());

    // Saved repos section
    const [savedRepos, setSavedRepos] = useState<SavedRepository[]>([]);
    const [savedPage, setSavedPage] = useState(1);

    // Load saved repos on mount
    useEffect(() => {
        reposService.getSaved()
            .then(({ repositories }) => {
                setSavedRepos(repositories);
                setSavedRepoIds(new Set(repositories.map((r) => r.id)));
            })
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
            // Reload saved list
            const { repositories } = await reposService.getSaved();
            setSavedRepos(repositories);
        } finally {
            setIsSavingRepos(false);
        }
    }, []);

    const handleDelete = useCallback(async (repoId: number) => {
        setIsSavingRepos(true);
        try {
            await reposService.deleteRepository(repoId);
            setSavedRepoIds((prev) => { const n = new Set(prev); n.delete(repoId); return n; });
            setSavedRepos((prev) => prev.filter((r) => r.id !== repoId));
        } finally {
            setIsSavingRepos(false);
        }
    }, []);

    const scrollToSearch = () =>
        searchBarRef.current?.scrollIntoView({ behavior: 'smooth' });

    const totalPages = Math.ceil(total / perPage);
    const savedTotalPages = Math.ceil(savedRepos.length / SAVED_PER_PAGE);
    const pagedSaved = savedRepos.slice((savedPage - 1) * SAVED_PER_PAGE, savedPage * SAVED_PER_PAGE);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h2 className="logo">GitHub Scout</h2>
                <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
            </header>

            {/* ── Search ── */}
            <form ref={searchBarRef} onSubmit={handleSearch} className="search-bar">
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

                {/* Loading */}
                {isSearching && (
                    <p className="status-message" style={{ opacity: 0.6 }}>⏳ Cargando repositorios...</p>
                )}

                {/* Empty search results */}
                {!isSearching && hasSearched && repos.length === 0 && !searchError && (
                    <EmptyState
                        title="Sin resultados"
                        message="No se encontraron repositorios. Intenta con otros criterios."
                    />
                )}

                {/* Search results */}
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

                {/* Search pagination */}
                {total > 0 && !isSearching && (
                    <div style={{ marginTop: '24px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={(p) => search(p)}
                        />
                    </div>
                )}

                {/* ── Saved Repos Section ── */}
                <section style={{ marginTop: '48px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
                        Mis Repositorios Guardados
                    </h3>

                    {savedRepos.length === 0 ? (
                        <EmptyState
                            title="No hay repos guardados"
                            message="Aún no has guardado ningún repositorio."
                            actionText="Buscar repos"
                            onAction={scrollToSearch}
                        />
                    ) : (
                        <>
                            <div className="repos-grid">
                                {pagedSaved.map((repo) => (
                                    <RepositoryCard
                                        key={repo.id}
                                        repo={repo as unknown as Repository}
                                        isSaved={true}
                                        isSaving={isSavingRepos}
                                        onSave={async () => {}}
                                        onDelete={() => handleDelete(repo.id)}
                                    />
                                ))}
                            </div>

                            {savedTotalPages > 1 && (
                                <div style={{ marginTop: '16px' }}>
                                    <Pagination
                                        currentPage={savedPage}
                                        totalPages={savedTotalPages}
                                        onPageChange={setSavedPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
