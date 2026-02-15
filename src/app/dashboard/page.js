'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
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
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

function getFileIcon(type) {
    if (type?.startsWith('image')) return '🖼️';
    if (type?.includes('pdf')) return '📄';
    if (type?.startsWith('video')) return '🎬';
    if (type?.includes('zip') || type?.includes('rar')) return '📦';
    if (type?.includes('doc') || type?.includes('word')) return '📝';
    if (type?.includes('sheet') || type?.includes('excel')) return '📊';
    return '📎';
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0, images: 0, documents: 0 });
    const [recentFiles, setRecentFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const statsRef = useRef(null);
    const recentRef = useRef(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (!loading && statsRef.current) {
            gsap.fromTo(statsRef.current.children,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
            );
        }
        if (!loading && recentRef.current && recentRef.current.children.length > 0) {
            gsap.fromTo(recentRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.3 }
            );
        }
    }, [loading]);

    async function fetchDashboardData() {
        try {
            const res = await fetch('/api/files?limit=5');
            if (res.ok) {
                const data = await res.json();
                const files = data.files || [];
                const totalSize = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
                const images = files.filter(f => f.fileType?.startsWith('image')).length;
                const documents = files.filter(f => !f.fileType?.startsWith('image')).length;

                setStats({
                    totalFiles: data.pagination?.total || files.length,
                    totalSize,
                    images,
                    documents,
                });
                setRecentFiles(files);
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
    }

    return (
        <div>
            {/* Stats */}
            <div ref={statsRef} className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon">📁</div>
                    <div className="stat-value">{stats.totalFiles}</div>
                    <div className="stat-label">Total Files</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">💾</div>
                    <div className="stat-value">{formatBytes(stats.totalSize)}</div>
                    <div className="stat-label">Storage Used</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">🖼️</div>
                    <div className="stat-value">{stats.images}</div>
                    <div className="stat-label">Images</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">📄</div>
                    <div className="stat-value">{stats.documents}</div>
                    <div className="stat-label">Documents</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 32 }}>
                <Link href="/dashboard/upload" className="quick-upload-btn">
                    📤 Upload New Files
                </Link>
            </div>

            {/* Recent Files */}
            <div className="section-header">
                <h2>Recent Uploads</h2>
                {recentFiles.length > 0 && (
                    <Link href="/dashboard/files">View All →</Link>
                )}
            </div>

            {recentFiles.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📂</div>
                    <h3>No files yet</h3>
                    <p>Upload your first file to get started with CloudVault.</p>
                </div>
            ) : (
                <div ref={recentRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {recentFiles.map((file) => (
                        <div key={file.id} className="file-list-item">
                            <div className="file-list-item-preview">
                                {file.fileType?.startsWith('image') ? (
                                    <img src={file.fileUrl} alt={file.fileName} />
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
