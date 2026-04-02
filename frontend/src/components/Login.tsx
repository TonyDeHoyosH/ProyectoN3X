import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';

const Login: React.FC = () => {
    const { login, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');
        
        if (!email.trim() || !password.trim()) {
            setValidationError('El correo y la contraseña son obligatorios.');
            return;
        }

        try {
            await login(email, password);
        } catch (err) {
            // El hook ya maneja el set del string 'error'
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Iniciar Sesión</h2>
            {error && <p className="error-message">{error}</p>}
            {validationError && <p className="error-message">{validationError}</p>}
            
            <form onSubmit={handleSubmit} className="login-form">
                <input 
                    type="email" 
                    placeholder="Correo Electrónico" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="form-input" 
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="form-input" 
                />
                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
            </form>
            <p className="login-footer">
                ¿No tienes cuenta? <Link to="/register" className="link">Regístrate</Link>
            </p>
        </div>
    );
};

export default Login;
