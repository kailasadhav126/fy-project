import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout, loading, getToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, upcoming: 0 });
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';

  // Fetch booking statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/bookings/stats/overview`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kumbh-light via-white to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-kumbh-text">
              My Profile | मेरी प्रोफ़ाइल
            </h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
          >
            ← Back to Home
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-kumbh-text">Account Details</h2>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="border-kumbh-orange text-kumbh-orange hover:bg-kumbh-light"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name | पूरा नाम
                </label>
                <Input
                  type="text"
                  value={user.name}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address | ईमेल पता
                </label>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number | फोन नंबर
                </label>
                <Input
                  type="tel"
                  value={user.phone}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type | खाता प्रकार
                </label>
                <Input
                  type="text"
                  value={user.role === 'admin' ? 'Admin' : 'User'}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-kumbh-orange text-white hover:bg-kumbh-deep"
                  onClick={() => {
                    alert('Profile update functionality coming soon!');
                    setIsEditing(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card 
            className="p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setLocation('/my-bookings?filter=all')}
          >
            <div className="text-3xl font-bold text-kumbh-orange mb-2">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-xs text-gray-400 mt-1">Click to view all</div>
          </Card>
          <Card 
            className="p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setLocation('/my-bookings?filter=completed')}
          >
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-xs text-gray-400 mt-1">Click to view</div>
          </Card>
          <Card 
            className="p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setLocation('/my-bookings?filter=upcoming')}
          >
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
            <div className="text-xs text-gray-400 mt-1">Click to view</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-kumbh-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setLocation('/my-bookings')}
              variant="outline"
              className="justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="font-semibold">View My Bookings</div>
                <div className="text-sm text-gray-500">See all your reservations</div>
              </div>
            </Button>
            <Button
              onClick={() => setLocation('/hotel-booking')}
              variant="outline"
              className="justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="font-semibold">Book a Hotel</div>
                <div className="text-sm text-gray-500">Find and book accommodation</div>
              </div>
            </Button>
            <Button
              onClick={() => alert('Change password functionality coming soon!')}
              variant="outline"
              className="justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="font-semibold">Change Password</div>
                <div className="text-sm text-gray-500">Update your password</div>
              </div>
            </Button>
            <Button
              onClick={() => {
                if (confirm('Are you sure you want to logout?')) {
                  logout();
                }
              }}
              variant="outline"
              className="justify-start h-auto py-4 text-red-600 hover:bg-red-50"
            >
              <div className="text-left">
                <div className="font-semibold">Logout</div>
                <div className="text-sm text-gray-500">Sign out of your account</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
