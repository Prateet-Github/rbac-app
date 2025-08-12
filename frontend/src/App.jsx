import React from 'react';
import Login from './components/Login';
import Profile from './components/Profile';
import { useAuth } from './authContext';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

export default function App() {
  const { role, logout } = useAuth();

  return (
    <BrowserRouter>
      <div style={{ padding: 20 }}>
        <h1>RBAC Demo</h1>
        <div>
          <Link to="/">Home</Link>
          {role !== 'guest' && (
            <button onClick={logout} style={{ marginLeft: 10 }}>Logout</button>
          )}
          <div>Role: {role}</div>
        </div>

        <Routes>
          <Route path="/" element={<div><Login /><Profile /></div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}