'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import Link from 'next/link';

export default function MechanicLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // TODO: Implement actual login API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setTimeout(() => {
                console.log('Login attempt with:', { email, password });
                fetch('/api/v1/validatelogin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log('Login response:', data);
                        if (data.statusCode === "200") {
                            sessionStorage.setItem('authToken', data.data);
                            router.push('/mechanic/dashboard');
                        } else {
                            toast.current.show({ severity: 'error', summary: 'Error', detail: data.message });
                        }
                    })
                    .catch((error) => {
                        console.error('Error during login:', error);
                        // Handle login error here (e.g., show error message)
                    })


                setIsLoading(false);
            }, 1000);
            // Navigate to mechanic dashboard on success

        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                        <i className="pi pi-wrench text-4xl text-white"></i>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Mechanic Login
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in to manage your services
                    </p>
                </div>

                {/* Login Card */}
                <Card className="shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Message severity="error" text={error} className="w-full" />
                        )}

                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-300">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="mechanic@example.com"
                                className="w-full"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-300">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <Password
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                toggleMask
                                feedback={false}
                                className="w-full"
                                inputClassName="w-full"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    inputId="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.checked)}
                                    disabled={loading}
                                />
                                <label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                            <Link
                                href="/mechanic/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            label={loading ? 'Signing in...' : 'Sign In'}
                            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
                            className="w-full p-button-lg"
                            loading={loading}
                            disabled={loading}
                        />

                        {/* Divider */}
                        <Divider align="center">
                            <span className="text-gray-500 text-sm">OR</span>
                        </Divider>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                <Link
                                    href="/mechanic/signup"
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                                >
                                    Sign up as a mechanic
                                </Link>
                            </p>
                        </div>
                    </form>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                    © 2026 YMechanics. All rights reserved.
                </p>
            </div>
        </div>
    );
}
