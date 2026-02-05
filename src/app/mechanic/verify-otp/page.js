"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";

export default function VerifyOTP() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const name = searchParams.get("name");

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!email) {
            router.push("/mechanic/sign-up");
        }
    }, [email, router]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/v1/providers/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    otp,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "OTP verification failed");
            }

            setSuccess("Email verified successfully! Redirecting to login...");

            setTimeout(() => {
                router.push("/mechanic/login");
            }, 2000);

        } catch (err) {
            setError(err.message || "Failed to verify OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("/api/v1/providers/resend-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to resend OTP");
            }

            setSuccess("OTP has been resent to your email");
        } catch (err) {
            setError(err.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-6">
                    <Avatar
                        icon="pi pi-shield"
                        size="xlarge"
                        shape="circle"
                        className="mb-4"
                        style={{ backgroundColor: '#4F46E5', color: '#ffffff' }}
                    />
                    <h2 className="text-3xl font-bold text-gray-900">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We've sent a verification code to your email
                    </p>
                </div>

                <Divider />

                {/* Provider Details */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar
                            icon="pi pi-user"
                            size="large"
                            shape="circle"
                            style={{ backgroundColor: '#3B82F6', color: '#ffffff' }}
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{name || "Mechanic"}</h3>
                            <p className="text-sm text-gray-600">{email}</p>
                        </div>
                        <Tag value="Pending" severity="warning" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="pi pi-info-circle"></i>
                        <span>Please verify your email to activate your account</span>
                    </div>
                </div>

                {error && (
                    <Message
                        severity="error"
                        text={error}
                        className="w-full mb-4"
                    />
                )}

                {success && (
                    <Message
                        severity="success"
                        text={success}
                        className="w-full mb-4"
                    />
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div>
                        <label
                            htmlFor="otp"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Enter 6-Digit OTP
                        </label>
                        <InputText
                            id="otp"
                            value={otp}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setOtp(value);
                            }}
                            placeholder="000000"
                            className="w-full text-center text-2xl tracking-widest"
                            maxLength={6}
                            required
                            autoFocus
                        />
                        <small className="text-gray-500 block mt-2 text-center">
                            Enter the 6-digit code sent to your email
                        </small>
                    </div>

                    <Button
                        type="submit"
                        label={loading ? "Verifying..." : "Verify OTP"}
                        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                        className="w-full"
                        loading={loading}
                        disabled={otp.length !== 6}
                    />
                </form>

                <Divider align="center">
                    <span className="text-gray-500 text-sm">Didn't receive the code?</span>
                </Divider>

                <div className="text-center">
                    <Button
                        label="Resend OTP"
                        icon="pi pi-refresh"
                        link
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-indigo-600 hover:text-indigo-700"
                    />
                </div>

                <div className="mt-6 text-center">
                    <Button
                        label="Back to Sign Up"
                        icon="pi pi-arrow-left"
                        link
                        onClick={() => router.push("/mechanic/sign-up")}
                        className="text-gray-600 hover:text-gray-700"
                    />
                </div>
            </Card>

            <style jsx global>{`
                .p-inputtext:focus {
                    box-shadow: 0 0 0 0.2rem rgba(79, 70, 229, 0.25);
                    border-color: #4F46E5;
                }
                
                .p-button {
                    background-color: #4F46E5;
                    border-color: #4F46E5;
                }
                
                .p-button:hover {
                    background-color: #4338CA;
                    border-color: #4338CA;
                }
                
                .p-button:disabled {
                    opacity: 0.6;
                }
            `}</style>
        </div>
    );
}