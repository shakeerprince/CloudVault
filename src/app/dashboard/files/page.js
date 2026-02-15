'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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
    if (type?.includes('doc') || type?.includes('word')) return '📝';
    return '📎';
}

export default function FilesPage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [deleteModal, setDeleteModal] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const gridRef = useRef(null);

    useEffect(() => {
        fetchFiles();
    }, [search, typeFilter, pagination.page]);

    useEffect(() => {
        if (!loading && gridRef.current && gridRef.current.children.length > 0) {
            gsap.fromTo(gridRef.current.children,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out' }
            );
        }
    }, [loading, files, view]);

    function addToast(message, type = 'info') {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }

    async function fetchFiles() {
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: '20',
            });
            if (search) params.set('search', search);
            if (typeFilter) params.set('type', typeFilter);

            const res = await fetch(`/api/files?${params}`);
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
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(fileId) {
        try {
            const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
            if (res.ok) {
                setFiles(prev => prev.filter(f => f.id !== fileId));
                addToast('File deleted successfully', 'success');
            } else {
                addToast('Failed to delete file', 'error');
            }
        } catch (err) {
            addToast('Error deleting file', 'error');
        }
        setDeleteModal(null);
    }

    function copyLink(url) {
        navigator.clipboard.writeText(url);
        addToast('📋 Link copied to clipboard', 'success');
    }

    if (loading) {
        return <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
    }

    return (
        <div>
            {/* Toolbar */}
            <div className="files-toolbar">
                <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search files..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                    />
                </div>

                <button
                    className={`filter-btn ${typeFilter === '' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${typeFilter === 'image' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('image')}
                >
                    🖼️ Images
                </button>
                <button
                    className={`filter-btn ${typeFilter === 'application/pdf' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('application/pdf')}
                >
                    📄 PDFs
                </button>
                <button
                    className={`filter-btn ${typeFilter === 'video' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('video')}
                >
                    🎬 Videos
                </button>

                <div className="view-toggle">
                    <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>▦</button>
                    <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>☰</button>
                </div>
            </div>

            {/* Files display */}
            {files.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3>No files found</h3>
                    <p>{search || typeFilter ? 'Try adjusting your search or filters.' : 'Upload some files to see them here.'}</p>
                </div>
            ) : view === 'grid' ? (
                <div ref={gridRef} className="files-grid">
                    {files.map((file) => (
                        <div key={file.id} className="file-card">
                            <div className="file-card-preview">
                                {file.fileType?.startsWith('image') ? (
                                    <img src={file.fileUrl} alt={file.fileName} loading="lazy" />
                                ) : (
                                    <span className="file-icon-large">{getFileIcon(file.fileType)}</span>
                                )}
                            </div>
                            <div className="file-card-body">
                                <div className="file-card-name" title={file.fileName}>{file.fileName}</div>
                                <div className="file-card-meta">
                                    <span>{formatBytes(file.fileSize)}</span>
                                    <span>{formatDate(file.createdAt)}</span>
                                </div>
                            </div>
                            <div className="file-card-actions">
                                <button className="file-action-btn" onClick={() => copyLink(file.fileUrl)}>
                                    📋 Copy
                                </button>
                                <a
                                    className="file-action-btn"
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none' }}
                                >
                                    ↗ Open
                                </a>
                                <button className="file-action-btn delete" onClick={() => setDeleteModal(file)}>
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div ref={gridRef} className="files-list">
                    {files.map((file) => (
                        <div key={file.id} className="file-list-item">
                            <div className="file-list-item-preview">
                                {file.fileType?.startsWith('image') ? (
                                    <img src={file.fileUrl} alt={file.fileName} loading="lazy" />
                                ) : (
                                    <span style={{ fontSize: 24 }}>{getFileIcon(file.fileType)}</span>
                                )}
                            </div>
                            <div className="file-list-item-info">
                                <div className="file-list-item-name">{file.fileName}</div>
                                <div className="file-list-item-meta">
                                    {formatBytes(file.fileSize)} · {formatDate(file.createdAt)}
                                </div>
                            </div>
                            <div className="file-list-item-actions">
                                <button className="file-action-btn" onClick={() => copyLink(file.fileUrl)}>📋</button>
                                <a className="file-action-btn" href={file.fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>↗</a>
                                <button className="file-action-btn delete" onClick={() => setDeleteModal(file)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                    <button
                        className="filter-btn"
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        ← Previous
                    </button>
                    <span style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
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

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete File</h3>
                        <p>
                            Are you sure you want to delete <strong>{deleteModal.fileName}</strong>? This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="modal-btn danger" onClick={() => handleDelete(deleteModal.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
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
