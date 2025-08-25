'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function PaymentsPage() {
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '20 PR reviews per month',
        'Basic AI analysis',
        'GitHub integration',
        'Email support',
        'Community forum access'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'secondary',
      popular: false,
      stripePriceId: null
    },
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: '$10',
      period: 'per month',
      description: 'Best for individual developers',
      features: [
        'Unlimited PR reviews',
        'Advanced AI analysis',
        'Priority support',
        'Custom review rules',
        'Analytics dashboard',
        'API access'
      ],
      buttonText: 'Start Monthly Pro',
      buttonVariant: 'primary',
      popular: true,
      stripePriceId: 'price_monthly_pro'
    },
    {
      id: 'team',
      name: 'Team Pro',
      price: '$15',
      period: 'per month',
      description: 'Perfect for teams and organizations',
      features: [
        'Everything in Monthly Pro',
        'Team collaboration',
        'Role-based access',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees'
      ],
      buttonText: 'Start Team Pro',
      buttonVariant: 'primary',
      popular: false,
      stripePriceId: 'price_team_pro'
    }
  ];

  const handleSubscribe = async (planId: string, stripePriceId: string | null) => {
    if (!stripePriceId) {
      // Free plan - redirect to signup
      window.location.href = '/signup';
      return;
    }

    setLoading(planId);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripePriceId,
          planId: planId,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const loadStripe = async (publishableKey: string) => {
    if (typeof window !== 'undefined' && !window.Stripe) {
      const { loadStripe } = await import('@stripe/stripe-js');
      return loadStripe(publishableKey);
    }
    return window.Stripe?.(publishableKey);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'dark-bg' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`${isDark ? 'glass-dark' : 'glass'} fixed w-full z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>PR Reviewer</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/login"
                className={`${isDark ? 'text-white hover:text-purple-200' : 'text-gray-700 hover:text-gray-900'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`${isDark ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Choose Your Plan
            </h1>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Start with our free trial and upgrade when you're ready. All plans include our core AI-powered review features.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`subscription-card ${isDark ? 'modern-card-dark' : 'modern-card'} p-8 relative ${
                  plan.popular ? 'featured' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    {plan.name}
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 block`}>
                      {plan.price}
                    </span>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'} mr-3 mt-0.5 flex-shrink-0`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id, plan.stripePriceId)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    plan.buttonVariant === 'primary'
                      ? 'btn-primary text-white'
                      : isDark
                      ? 'btn-secondary-dark'
                      : 'btn-secondary'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Security & Trust Section */}
          <div className="mt-16 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                Secure Payment Processing
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Secure by Stripe
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    All payments are processed securely through Stripe with bank-level encryption.
                  </p>
                </div>
                <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    PCI Compliant
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    We never store your payment information. All data is handled by Stripe's secure infrastructure.
                  </p>
                </div>
                <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    30-Day Guarantee
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Not satisfied? Get a full refund within 30 days, no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className={`text-3xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-900'} mb-8`}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Can I switch plans anytime?
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  What happens after my free trial?
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  After your 20 free PR reviews, you can continue with a paid plan or your account will be paused until you upgrade.
                </p>
              </div>
              <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Do you offer refunds?
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Ready to get started?
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Join thousands of developers who trust PR Reviewer for their code reviews.
            </p>
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center px-8 py-3 text-lg font-medium rounded-lg"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
