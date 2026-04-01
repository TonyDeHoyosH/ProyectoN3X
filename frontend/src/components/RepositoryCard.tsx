import React from 'react';
import { Repository } from '../types';

interface Props {
    repo: Repository;
}

const RepositoryCard: React.FC<Props> = ({ repo }) => {
    return (
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3><a href={repo.url} target="_blank" rel="noreferrer">{repo.name}</a></h3>
            <p><strong>Owner:</strong> {repo.owner}</p>
            <p><strong>Stars:</strong> ⭐ {repo.stars}</p>
            <p><strong>Language:</strong> {repo.language || 'Not specified'}</p>
            {repo.description && <p>{repo.description}</p>}
        </div>
    );
};

export default RepositoryCard;
