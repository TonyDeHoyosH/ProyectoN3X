import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';

const RegisterPlaceholder: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>Registro de Cuenta</h2>
    <p>Componente pendiente de implementación.</p>
    <br/>
    <a href="/login" className="link-btn" style={{ padding: '10px' }}>Volver a Login</a>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPlaceholder />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
