'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const navItemsRef = useRef(null);

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/dashboard/upload', label: 'Upload', icon: '📤' },
        { href: '/dashboard/files', label: 'My Files', icon: '📁' },
    ];

    useEffect(() => {
        if (sidebarRef.current && navItemsRef.current) {
            gsap.fromTo(navItemsRef.current.children,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
            );
        }
    }, []);

    function getPageTitle() {
        if (pathname === '/dashboard') return { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your storage overview.' };
        if (pathname === '/dashboard/upload') return { title: 'Upload Files', subtitle: 'Drag & drop or browse to upload files.' };
        if (pathname === '/dashboard/files') return { title: 'My Files', subtitle: 'Browse and manage your uploaded files.' };
        if (pathname === '/dashboard/admin') return { title: 'Admin Panel', subtitle: 'Manage users, files, and system overview.' };
        return { title: 'Dashboard', subtitle: '' };
    }

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    const pageInfo = getPageTitle();

    return (
        <div className="dashboard-layout">
            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link href="/dashboard" className="sidebar-brand" onClick={() => setSidebarOpen(false)}>
                        <div className="sidebar-brand-icon">☁️</div>
                        <span className="sidebar-brand-text">CloudVault</span>
                    </Link>
                </div>

                <nav ref={navItemsRef} className="sidebar-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-item ${pathname === link.href ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                    {user?.role === 'ADMIN' && (
                        <>
                            <div className="nav-separator" />
                            <Link
                                href="/dashboard/admin"
                                className={`nav-item ${pathname === '/dashboard/admin' ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="nav-icon">🛡️</span>
                                Admin Panel
                            </Link>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.name || 'User'}</div>
                            <div className="user-role">{user?.role?.toLowerCase() || 'user'}</div>
                        </div>
                        <button className="logout-btn" onClick={logout} title="Logout">
                            🚪
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="main-header">
                    <div className="main-header-left">
                        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            ☰
                        </button>
                        <h1>{pageInfo.title}</h1>
                        <p>{pageInfo.subtitle}</p>
                    </div>
                </header>

                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
