import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    api.get('/auth/users').then(({data}) => setUsers(data.data.users)).catch(() => toast.error('Error fetching users'));
  }, []);

  const changeRole = async (id, role) => {
    try {
      await api.put(`/auth/users/${id}/role`, { role });
      setUsers(users.map(u => u._id === id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>User <span className="gradient-text">Management</span></h1>
          <p>Manage system access levels</p>
        </div>
      </div>
      <div className="table-wrapper glass-card-static">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td><td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'scheduler' ? 'badge-warning' : 'badge-indigo'}`}>{u.role}</span></td>
                <td>{u.isActive ? 'Active' : 'Disabled'}</td>
                <td>
                  <select className="form-select" style={{ width: 120, padding: 4 }} value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                    <option value="user">User</option>
                    <option value="scheduler">Scheduler</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
