import React, { useState, useCallback } from 'react';
import { Repository } from '../types';
import { reposService } from '../services/api';

interface RepositoryCardProps {
    repo: Repository;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repo }) => {
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = useCallback(async () => {
        if (saved) return;
        setSaving(true);
        try {
            await reposService.saveRepository(repo);
            setSaved(true);
        } catch (error) {
            console.error("No se pudo guardar el repositorio", error);
        } finally {
            setSaving(false);
        }
    }, [repo, saved]);

    return (
        <div className="repo-card">
            <div className="repo-header">
                {repo.ownerAvatar && (
                    <img src={repo.ownerAvatar} alt="owner avatar" className="avatar" />
                )}
                <div className="repo-title">
                    <h3 className="name">{repo.name}</h3>
                    <small className="full-name">{repo.fullName}</small>
                </div>
            </div>
            
            {repo.description && <p className="repo-description">{repo.description}</p>}
            
            <div className="repo-stats">
                <span className="stat">⭐ {repo.stars}</span>
                <span className="stat">🍴 {repo.forks}</span>
                {repo.language && <span className="stat">💻 {repo.language}</span>}
            </div>
            
            {repo.topics && repo.topics.length > 0 && (
                <div className="repo-topics">
                    {repo.topics.map(topic => (
                        <span key={topic} className="topic-badge">{topic}</span>
                    ))}
                </div>
            )}
            
            <div className="repo-actions">
                <a href={repo.url} target="_blank" rel="noreferrer" className="action-btn link-btn">
                    Ver en GitHub
                </a>
                <button 
                    onClick={handleSave} 
                    disabled={saved || saving} 
                    className="action-btn save-btn"
                >
                    {saving ? 'Guardando...' : saved ? 'Ya guardado' : 'Guardar'}
                </button>
            </div>
        </div>
    );
};

export default RepositoryCard;
