import React, { useState } from 'react';
import { reposService, authService } from '../services/api';
import { SearchResponse } from '../types';
import RepositoryCard from './RepositoryCard';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('stars');
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await reposService.search(query, sort);
            setResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Dashboard</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>
            
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    placeholder="Search repositories..." 
                    style={{ flex: 1 }}
                />
                <select value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="stars">Stars</option>
                    <option value="forks">Forks</option>
                    <option value="updated">Updated</option>
                </select>
                <button type="submit" disabled={!query || loading}>Search</button>
            </form>

            {loading && <p>Loading...</p>}

            {results && (
                <div>
                    <p>Found {results.total} results.</p>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {results.repositories.map(repo => (
                            <RepositoryCard key={repo.id} repo={repo} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
