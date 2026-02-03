'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // TODO: Implement actual password reset API call
            const response = await fetch('/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSuccess('Password reset instructions have been sent to your email address. Please check your inbox.');
                setEmail('');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to send reset email. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
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
                        <i className="pi pi-lock text-4xl text-white"></i>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        No worries, we'll send you reset instructions
                    </p>
                </div>

                {/* Reset Card */}
                <Card className="shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <Message severity="error" text={error} className="w-full" />}
                        {success && <Message severity="success" text={success} className="w-full" />}

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
                            <small className="text-gray-500 dark:text-gray-400">
                                Enter the email address associated with your account
                            </small>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            label={loading ? 'Sending...' : 'Send Reset Instructions'}
                            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-envelope'}
                            className="w-full p-button-lg"
                            loading={loading}
                            disabled={loading}
                        />

                        {/* Back to Login */}
                        <div className="text-center">
                            <Link
                                href="/mechanic/login"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                            >
                                <i className="pi pi-arrow-left text-sm"></i>
                                Back to login
                            </Link>
                        </div>

                        {/* Additional Help */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <i className="pi pi-info-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    <p className="font-semibold mb-1">Can't access your email?</p>
                                    <p>Please contact support at{' '}
                                        <a href="mailto:support@ymechanics.com" className="text-blue-600 dark:text-blue-400 underline">
                                            support@ymechanics.com
                                        </a>
                                    </p>
                                </div>
                            </div>
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
