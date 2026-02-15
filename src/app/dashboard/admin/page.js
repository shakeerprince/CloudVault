'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

function getFileIcon(type) {
    if (type?.startsWith('image')) return '🖼️';
    if (type?.includes('pdf')) return '📄';
    if (type?.startsWith('video')) return '🎬';
    if (type?.includes('zip') || type?.includes('rar')) return '📦';
    return '📎';
}

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [files, setFiles] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalFiles: 0, totalStorage: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [deleteModal, setDeleteModal] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const cardsRef = useRef(null);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [user, router]);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [search, selectedUser, pagination.page]);

    useEffect(() => {
        if (!loading && cardsRef.current && cardsRef.current.children.length > 0) {
            gsap.fromTo(cardsRef.current.children,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
            );
        }
    }, [loading, tab]);

    function addToast(message, type = 'info') {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }

    async function fetchUsers() {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setStats(data.stats || {});
            }
        } catch (err) {
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchFiles() {
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: '20',
            });
            if (search) params.set('search', search);
            if (selectedUser) params.set('userId', selectedUser);

            const res = await fetch(`/api/admin/files?${params}`);
            if (res.ok) {
                const data = await res.json();
                setFiles(data.files || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: data.pagination?.totalPages || 1,
                    total: data.pagination?.total || 0,
                }));
            }
        } catch (err) {
            console.error('Fetch files error:', err);
        }
    }

    async function handleDelete(fileId) {
        try {
            const res = await fetch('/api/admin/files', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId }),
            });
            if (res.ok) {
                setFiles(prev => prev.filter(f => f.id !== fileId));
                addToast('File deleted successfully', 'success');
                fetchUsers(); // refresh stats
            } else {
                addToast('Failed to delete file', 'error');
            }
        } catch (err) {
            addToast('Error deleting file', 'error');
        }
        setDeleteModal(null);
    }

    if (loading) {
        return <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
    }

    if (user?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="admin-page">
            {/* Admin Header */}
            <div className="admin-header">
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>🛡️ Admin Panel</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage users, files, and system overview</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
                    📊 Overview
                </button>
                <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
                    👥 Users ({stats.totalUsers})
                </button>
                <button className={`admin-tab ${tab === 'files' ? 'active' : ''}`} onClick={() => setTab('files')}>
                    📁 All Files ({stats.totalFiles})
                </button>
            </div>

            {/* Overview Tab */}
            {tab === 'overview' && (
                <div ref={cardsRef} className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>👥</div>
                        <div className="admin-stat-info">
                            <div className="admin-stat-value">{stats.totalUsers}</div>
                            <div className="admin-stat-label">Total Users</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #22d3ee)' }}>📁</div>
                        <div className="admin-stat-info">
                            <div className="admin-stat-value">{stats.totalFiles}</div>
                            <div className="admin-stat-label">Total Files</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>💾</div>
                        <div className="admin-stat-info">
                            <div className="admin-stat-value">{formatBytes(stats.totalStorage)}</div>
                            <div className="admin-stat-label">Total Storage</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>📈</div>
                        <div className="admin-stat-info">
                            <div className="admin-stat-value">
                                {stats.totalUsers > 0 ? (stats.totalFiles / stats.totalUsers).toFixed(1) : 0}
                            </div>
                            <div className="admin-stat-label">Avg Files/User</div>
                        </div>
                    </div>

                    {/* Top Users */}
                    <div className="admin-section-card" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🏆 Top Users by Storage</h3>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Files</th>
                                        <th>Storage</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...users].sort((a, b) => b.totalStorage - a.totalStorage).slice(0, 5).map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="admin-avatar">{u.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{u.name}</div>
                                                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>@{u.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={`admin-badge ${u.role?.toLowerCase()}`}>{u.role}</span></td>
                                            <td>{u.fileCount}</td>
                                            <td>{formatBytes(u.totalStorage)}</td>
                                            <td>{formatDate(u.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {tab === 'users' && (
                <div ref={cardsRef} className="admin-users-grid">
                    {users.map(u => (
                        <div key={u.id} className="admin-user-card">
                            <div className="admin-user-card-header">
                                <div className="admin-avatar large">{u.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                <span className={`admin-badge ${u.role?.toLowerCase()}`}>{u.role}</span>
                            </div>
                            <h4 style={{ marginTop: 12, fontWeight: 600 }}>{u.name}</h4>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>@{u.username}</p>
                            <div className="admin-user-stats">
                                <div>
                                    <div className="admin-user-stat-value">{u.fileCount}</div>
                                    <div className="admin-user-stat-label">Files</div>
                                </div>
                                <div>
                                    <div className="admin-user-stat-value">{formatBytes(u.totalStorage)}</div>
                                    <div className="admin-user-stat-label">Storage</div>
                                </div>
                            </div>
                            <button
                                className="admin-view-files-btn"
                                onClick={() => { setSelectedUser(u.id); setTab('files'); }}
                            >
                                View Files →
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Files Tab */}
            {tab === 'files' && (
                <div>
                    {/* Toolbar */}
                    <div className="admin-files-toolbar">
                        <div className="search-input-wrap">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search all files..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                            />
                        </div>
                        {selectedUser && (
                            <button
                                className="filter-btn active"
                                onClick={() => { setSelectedUser(''); setPagination(prev => ({ ...prev, page: 1 })); }}
                            >
                                ✕ Clear user filter
                            </button>
                        )}
                        <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: 13 }}>
                            {pagination.total} files total
                        </span>
                    </div>

                    {/* Files Table */}
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>File Name</th>
                                    <th>Owner</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Uploaded</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                                            No files found
                                        </td>
                                    </tr>
                                ) : (
                                    files.map(file => (
                                        <tr key={file.id}>
                                            <td style={{ width: 40 }}>
                                                {file.fileType?.startsWith('image') ? (
                                                    <img
                                                        src={file.fileUrl}
                                                        alt=""
                                                        style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: 20 }}>{getFileIcon(file.fileType)}</span>
                                                )}
                                            </td>
                                            <td>
                                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                                                    {file.fileName?.length > 30 ? file.fileName.slice(0, 30) + '...' : file.fileName}
                                                </a>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div className="admin-avatar small">{file.user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                                    <span style={{ fontSize: 13 }}>{file.user?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{file.fileType}</td>
                                            <td>{formatBytes(file.fileSize)}</td>
                                            <td style={{ fontSize: 13 }}>{formatDate(file.createdAt)}</td>
                                            <td>
                                                <button
                                                    className="file-action-btn delete"
                                                    onClick={() => setDeleteModal(file)}
                                                    title="Delete file"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                            <button
                                className="filter-btn"
                                disabled={pagination.page <= 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                ← Previous
                            </button>
                            <span style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                className="filter-btn"
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>⚠️ Delete File</h3>
                        <p>
                            Delete <strong>{deleteModal.fileName}</strong> uploaded by <strong>{deleteModal.user?.name}</strong>?
                            This removes it from both S3 and database.
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="modal-btn danger" onClick={() => handleDelete(deleteModal.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts */}
            {toasts.length > 0 && (
                <div className="toast-container">
                    {toasts.map(toast => (
                        <div key={toast.id} className={`toast ${toast.type}`}>
                            {toast.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
