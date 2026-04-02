import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks';
import { reposService } from '../services/api';
import { Repository } from '../types';
import RepositoryCard from './RepositoryCard';

const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('stars');
    const [page, setPage] = useState(1);
    const [perPage] = useState(20);
    const [repos, setRepos] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    const search = useCallback(async (searchPage: number) => {
        if (!query.trim()) return;
        setLoading(true);
        setHasSearched(true);
        
        try {
            const data = await reposService.search(query, sort, perPage, searchPage);
            setRepos(data.repositories);
            setTotal(data.total);
            setPage(searchPage);
        } catch (error) {
            console.error('Error buscando repositorios:', error);
        } finally {
            setLoading(false);
        }
    }, [query, sort, perPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        search(1);
    };

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
                <button type="submit" disabled={loading || !query.trim()} className="search-btn">
                    Buscar
                </button>
            </form>

            <main className="dashboard-content">
                {loading && <p className="status-message">Cargando...</p>}
                
                {!loading && hasSearched && repos.length === 0 && (
                    <p className="status-message">No hay resultados para esta búsqueda.</p>
                )}

                {!loading && repos.length > 0 && (
                    <div className="repos-grid">
                        {repos.map(repo => (
                            <RepositoryCard key={repo.id} repo={repo} />
                        ))}
                    </div>
                )}

                {total > 0 && (
                    <div className="pagination">
                        <button 
                            disabled={page <= 1 || loading} 
                            onClick={() => search(page - 1)}
                            className="page-btn"
                        >
                            Anterior
                        </button>
                        <span className="page-info">Página {page}</span>
                        <button 
                            disabled={page * perPage >= total || loading} 
                            onClick={() => search(page + 1)}
                            className="page-btn"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
