'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import gsap from 'gsap';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, user } = useAuth();
    const router = useRouter();

    const cardRef = useRef(null);
    const orb1Ref = useRef(null);
    const orb2Ref = useRef(null);
    const orb3Ref = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
            return;
        }

        // GSAP entrance animations
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(cardRef.current,
            { opacity: 0, y: 60, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8 }
        );

        // Animate form elements
        if (formRef.current) {
            const children = formRef.current.children;
            tl.fromTo(children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                '-=0.4'
            );
        }

        // Floating orb animations
        gsap.to(orb1Ref.current, {
            x: -40, y: 30, scale: 1.1,
            duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
        gsap.to(orb2Ref.current, {
            x: 30, y: -25, scale: 1.15,
            duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
        gsap.to(orb3Ref.current, {
            scale: 1.3, opacity: 0.3,
            duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
    }, [user, router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);

            // Success animation
            gsap.to(cardRef.current, {
                scale: 0.98, opacity: 0.8,
                duration: 0.2, yoyo: true, repeat: 1,
                onComplete: () => router.push('/dashboard'),
            });
        } catch (err) {
            setError(err.message);
            gsap.fromTo(cardRef.current,
                { x: -8 },
                { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div ref={orb1Ref} className="auth-bg-orb" />
                <div ref={orb2Ref} className="auth-bg-orb" />
                <div ref={orb3Ref} className="auth-bg-orb" />
                <div className="auth-grid-overlay" />
            </div>

            <div ref={cardRef} className="auth-card" style={{ opacity: 0 }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon">☁️</div>
                    <span className="auth-logo-text">CloudVault</span>
                </div>
                <p className="auth-subtitle">
                    Sign in to access your secure cloud storage
                </p>

                <form ref={formRef} className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="form-input"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={isLoading}>
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className="spinner" /> Signing in...
                            </span>
                        ) : (
                            <>
                                Sign In
                                <span className="btn-shimmer" />
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-link">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup">Create one</Link>
                </p>
            </div>
        </div>
    );
}
