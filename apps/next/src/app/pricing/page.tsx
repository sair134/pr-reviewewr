'use client';
import { useState, useEffect } from 'react';

interface Plans {
  _id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
}

interface User {
  email?: string;
  name: string;
  image?: string;
  githubToken?: string;
  bitbucketToken?: string;
  githubUsername?: string;
  bitbucketUsername?: string;
  githubId?: string;
  bitbucketId?: string;
}

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    setLoading(false);
  };

  const handlePlanClick = (planName: string) => {
    if (user) {
      // User is logged in, redirect to payment page
      window.location.href = `/payment?plan=${planName.toLowerCase()}`;
    } else {
      // User is not logged in, redirect to signup
      window.location.href = '/signup';
    }
  };
  const [plans, setPlans] = useState<Plans[]>([]);

  useEffect(() => {
    fetchUserData();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-16 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h1>
        <p className="text-gray-600 text-lg mb-12">
          Start your <span className="text-primary-400 font-semibold">30-day free trial</span>. 
          No credit card required.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
        {plans.map((plan, idx) => (
          <div
            key={plan._id}
            className="rounded-2xl border border-primary-200 bg-white/80 backdrop-blur-sm shadow-lg p-8 flex flex-col"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-900">{plan.name}</h2>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <p className="text-3xl font-bold mb-6 text-gray-900">{plan.price}</p>
            <ul className="space-y-3 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanClick(plan.name)}
              className="mt-8 w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 text-center transition"
            >
              {loading ? 'Loading...' : (user ? 'Get Started' : 'Start Free Trial')}
            </button>
          </div>
        ))}
      </div>
      <div className="text-center mt-16 text-gray-600">
        <p>
          Cancel anytime during your free trial. No hidden fees.
        </p>
      </div>
    </div>
  );
}
