import React, { useState } from 'react';
import { useAuth } from '../authContext';

export default function Profile(){
  const { authFetch, role } = useAuth();
  const [userIdToDelete, setUserIdToDelete] = useState('');

  async function fetchProfile(){
    try {
      const res = await authFetch({ url: 'http://localhost:5001/api/profile', method: 'get' });
      alert(JSON.stringify(res.data, null, 2));
    } catch (err) {
      alert(err.response?.data?.message || 'Error fetching profile');
    }
  }

  async function deleteUser(){
    if (!userIdToDelete) {
      alert('Enter user ID');
      return;
    }
    try {
      await authFetch({ 
        url: `http://localhost:5001/api/user/${userIdToDelete}`, 
        method: 'delete' 
      });
      alert('User deleted');
      setUserIdToDelete('');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div>
      <h3>Profile area</h3>
      <div>Role: {role}</div>
      <button onClick={fetchProfile}>Get profile</button>
      
      {role === 'admin' && (
        <div style={{ marginTop: 20 }}>
          <input 
            placeholder="User ID to delete" 
            value={userIdToDelete} 
            onChange={e => setUserIdToDelete(e.target.value)} 
          />
          <button onClick={deleteUser}>Delete User</button>
        </div>
      )}
    </div>
  );
}