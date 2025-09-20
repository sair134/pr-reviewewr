'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
interface User {
    id: string;
    email: string;
    name: string;
}

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const planName = searchParams.get('plan');
    console.log("planName", planName);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);
    const [hasExistingLicense, setHasExistingLicense] = useState(false);
    const [existingLicense, setExistingLicense] = useState<any>(null);
    const [checkingLicense, setCheckingLicense] = useState(true);
    useEffect(() => {
        setMounted(true);
        fetchUserData();
    }, []);

    useEffect(() => {
        if (user && planName) {
            checkExistingLicense();
        }
    }, [user, planName]);
    const fetchUserData = async () => {
        const response = await fetch('/api/user');
        if (response.ok) {
            const data = await response.json();
            console.log("user data", data);
            setUser(data);
        }
    }

    const checkExistingLicense = async () => {
        if (!user || !planName) return;
        
        setCheckingLicense(true);
        try {
            const response = await fetch(`/api/license?userId=${user.id}&planName=${planName}`);
            if (response.ok) {
                const data = await response.json();
                setHasExistingLicense(data.hasLicense);
                setExistingLicense(data.license);
                console.log("License check result:", data);
            }
        } catch (error) {
            console.error("Error checking license:", error);
        }
        setCheckingLicense(false);
    }
    const handlePayment = async () => {
        setLoading(true);
        setMessage('processing payment...');
        try {
            const response = await fetch('/api/license', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({UserId: user?.id, PlanName: planName}),
            });
            if (response.ok) {
                const data = await response.json();
                setMessage(
                    `Payment successful! License created successfully until ${new Date(data.expiresAt).toLocaleDateString()}`
                  );
                // Refresh license check after successful purchase
                checkExistingLicense();
                console.log("Payment successful", data);
            } else {
                setMessage('Payment failed!');
            }
        } catch (error) {
            console.log("Error", error);
            setMessage('Error processing payment!');
        }
        setLoading(false);
    }
    // Prevent hydration mismatch by not rendering dynamic content until mounted
    if (!mounted || checkingLicense) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-16 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">Payment</h1>
                    <p className="text-gray-600 text-lg mb-12">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-16 px-6">
            <div className="max-w-5xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Payment</h1>
                <p className="text-gray-600 text-lg mb-12">
                    {hasExistingLicense 
                        ? `You already have an active ${planName || 'selected'} plan.`
                        : `You are about to purchase the ${planName || 'selected'} plan.`
                    }
                </p>
                
                {hasExistingLicense ? (
                    <div className="mt-8">
                        <div className="w-full rounded-xl bg-green-100 border-2 border-green-300 text-green-800 font-semibold py-3 text-center">
                            ✅ Already Purchased
                        </div>
                        {existingLicense && (
                            <p className="text-gray-600 text-sm mt-4">
                                License expires on: {new Date(existingLicense.expiresAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={handlePayment}
                        className="mt-8 w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 text-center transition"
                    >
                        {loading ? 'Loading...' : 'Purchase Plan'}
                    </button>
                )}
                
                {message && <p className="text-gray-600 text-lg mb-12">{message}</p>}
            </div>
        </div>
    );
}