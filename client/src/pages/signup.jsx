import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { consumeBookingRedirect } from '@/lib/booking-flow';

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);
    
    if (result.success) {
      setLocation(consumeBookingRedirect() || '/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kumbh-light via-white to-orange-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-kumbh-orange text-white p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 9.5V11.5L21 9ZM3 9L9 11.5V9.5L3 7V9ZM12 7.5C12.8 7.5 13.5 8.2 13.5 9S12.8 10.5 12 10.5 10.5 9.8 10.5 9 11.2 7.5 12 7.5Z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-kumbh-text mb-2">
            Create Account | खाता बनाएं
          </h1>
          <p className="text-gray-600">
            Join Kumbh Sahyogi for a seamless experience
          </p>
        </div>

        {/* Signup Form */}
        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name | पूरा नाम
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address | ईमेल पता
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number | फोन नंबर
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password | पासवर्ड
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password | पासवर्ड की पुष्टि करें
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep py-6 text-lg font-semibold"
            >
              {loading ? 'Creating Account...' : 'Sign Up | साइन अप करें'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setLocation('/login')}
                className="text-kumbh-orange font-semibold hover:underline"
              >
                Login | लॉगिन करें
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setLocation('/')}
              className="text-gray-500 hover:text-kumbh-orange text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </Card>

        {/* Benefits Box */}
        <Card className="mt-6 p-4 bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">✨</div>
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">Benefits of Signing Up</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Quick and easy booking process</li>
                <li>Save your favorite locations</li>
                <li>Access booking history</li>
                <li>Receive important updates</li>
                <li>Priority customer support</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
