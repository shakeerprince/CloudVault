'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import gsap from 'gsap';
import Link from 'next/link';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CUSTOMER');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, user } = useAuth();
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

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(cardRef.current,
            { opacity: 0, y: 60, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8 }
        );

        if (formRef.current) {
            const children = formRef.current.children;
            tl.fromTo(children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                '-=0.4'
            );
        }

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

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await register(name, username, password, role);

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
                    Create your account to start storing files securely
                </p>

                <form ref={formRef} className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="form-input"
                            placeholder="Choose a username"
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
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Account Type</label>
                        <select
                            id="role"
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="CUSTOMER">Customer</option>
                            <option value="MECHANIC">Mechanic</option>
                        </select>
                    </div>

                    <button type="submit" className="auth-btn" disabled={isLoading}>
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className="spinner" /> Creating account...
                            </span>
                        ) : (
                            <>
                                Create Account
                                <span className="btn-shimmer" />
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account?{' '}
                    <Link href="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
