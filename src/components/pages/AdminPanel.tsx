// src/components/pages/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import apiClient from '../../api/apiClient';
import './AdminPanel.css';

interface AdminUser {
    id: number;
    nickname: string;
    email: string;
    role: string;
    profile_completed: boolean;
    created_at: string | null;
}

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await apiClient.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev =>
                prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
            );
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error updating role');
        }
    };

    const handleDelete = async (userId: number, email: string) => {
        if (!window.confirm(`Delete user ${email}?`)) return;

        try {
            await apiClient.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error deleting user');
        }
    };

    return (
        <div className="admin-page">
            <Header />
            <div className="admin-container">
                <h1 className="admin-title">Admin Panel</h1>
                <p className="admin-subtitle">User Management</p>

                {loading ? (
                    <div className="admin-loading">Loading...</div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nickname</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Profile</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.nickname}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`role-select role-${user.role}`}
                                            >
                                                <option value="user">user</option>
                                                <option value="pro">pro</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={user.profile_completed ? 'status-ok' : 'status-pending'}>
                                                {user.profile_completed ? 'Complete' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(user.id, user.email)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AdminPanel;
