// src/components/pages/AdminPanel.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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

interface UsersResponse {
    items: AdminUser[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

const AdminPanel: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 20;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, page_size: pageSize };
            if (search) params.search = search;
            if (role) params.role = role;

            const response = await apiClient.get<UsersResponse>('/admin/users', { params });
            setUsers(response.data.items);
            setTotal(response.data.total);
            setPages(response.data.pages);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    }, [search, role, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const setParam = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        if (key !== 'page') next.set('page', '1');
        setSearchParams(next);
    };

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
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error deleting user');
        }
    };

    return (
        <div className="admin-page">
            <Header />
            <div className="admin-container">
                <h1 className="admin-title">Admin Panel</h1>
                <p className="admin-subtitle">User Management · {total} users</p>

                <div className="admin-filters">
                    <input
                        type="text"
                        className="admin-search"
                        placeholder="Search by email or nickname..."
                        value={search}
                        onChange={(e) => setParam('search', e.target.value)}
                    />
                    <select
                        className="admin-role-filter"
                        value={role}
                        onChange={(e) => setParam('role', e.target.value)}
                    >
                        <option value="">All roles</option>
                        <option value="user">user</option>
                        <option value="pro">pro</option>
                        <option value="admin">admin</option>
                    </select>
                </div>

                {loading ? (
                    <div className="admin-loading">Loading...</div>
                ) : (
                    <>
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
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="admin-empty">No users found</td>
                                        </tr>
                                    ) : users.map(user => (
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

                        {pages > 1 && (
                            <div className="admin-pagination">
                                <button
                                    className="admin-page-btn"
                                    disabled={page <= 1}
                                    onClick={() => setParam('page', String(page - 1))}
                                >
                                    ← Prev
                                </button>
                                <span className="admin-page-info">Page {page} of {pages}</span>
                                <button
                                    className="admin-page-btn"
                                    disabled={page >= pages}
                                    onClick={() => setParam('page', String(page + 1))}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AdminPanel;
