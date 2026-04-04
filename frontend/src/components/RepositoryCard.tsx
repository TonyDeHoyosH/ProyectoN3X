import React, { useState } from 'react';
import { Repository } from '../types';
import ConfirmModal from './ConfirmModal';

interface Props {
    repo: Repository;
    isSaved: boolean;
    isSaving: boolean;
    onSave: () => Promise<void>;
    onDelete: () => Promise<void>;
}

const RepositoryCard: React.FC<Props> = ({ repo, isSaved, isSaving, onSave, onDelete }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSaveClick = async () => {
        if (isSaved) {
            setShowConfirm(true);
        } else {
            await onSave();
        }
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete();
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
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
                        {repo.topics.map((topic) => (
                            <span key={topic} className="topic-badge">{topic}</span>
                        ))}
                    </div>
                )}

                <div className="repo-actions">
                    <a href={repo.url} target="_blank" rel="noreferrer" className="action-btn link-btn">
                        Ver en GitHub
                    </a>
                    <button
                        onClick={handleSaveClick}
                        disabled={isSaving || isDeleting}
                        className={`action-btn save-btn${isSaved ? ' saved' : ''}`}
                    >
                        {isSaving && !isSaved
                            ? 'Guardando...'
                            : isSaved
                            ? 'Ya guardado'
                            : 'Guardar'}
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirm}
                title="Eliminar repositorio"
                message={`¿Eliminar "${repo.name}" de tus guardados?`}
                confirmText="Eliminar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowConfirm(false)}
                isLoading={isDeleting}
            />
        </>
    );
};

export default RepositoryCard;
