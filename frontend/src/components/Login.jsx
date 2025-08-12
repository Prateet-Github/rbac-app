import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../authContext';

export default function Login(){
  const { login } = useAuth();
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');

  async function submit(e){
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { username, password });
      console.log({ username, password });
      const token = res.data.token;
      login(token);
      alert('Logged in');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <form onSubmit={submit} style={{ marginBottom: 20 }}>
      <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} autoComplete='username'/>
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete='current-password'/>
      <button type="submit">Login</button>
    </form>
  );
}