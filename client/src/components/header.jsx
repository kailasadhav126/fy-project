import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export default function Header({ onSOSClick }) {
  const { t, toggleLanguage } = useLanguage();
  const [location, setLocation] = useLocation();
  const [isTravelDropdownOpen, setIsTravelDropdownOpen] = useState(false);
  const [isStayDropdownOpen, setIsStayDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleNavigation = (path) => {
    setLocation(path);
    setIsTravelDropdownOpen(false);
  };

  const handleSOSClick = () => {
    if (location === '/') {
      // If on homepage, scroll to emergency section
      const element = document.getElementById('emergency-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on other pages, use the modal
      onSOSClick();
    }
  };

  return (
    <header className="bg-white shadow-lg border-b-2 border-kumbh-orange sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-kumbh-orange text-white p-2 rounded-full">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 9.5V11.5L21 9ZM3 9L9 11.5V9.5L3 7V9ZM12 7.5C12.8 7.5 13.5 8.2 13.5 9S12.8 10.5 12 10.5 10.5 9.8 10.5 9 11.2 7.5 12 7.5Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-kumbh-text" data-testid="app-title">
                {t('app.title')}
              </h1>
              <p className="text-sm text-gray-600 font-devanagari hidden sm:block" data-testid="app-subtitle">
                {t('app.subtitle.hindi')}
              </p>
            </div>
          </div>

          {/* Right Side: Navigation Menu + Buttons */}
          <div className="flex items-center space-x-6">
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => handleNavigation('/')}
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                location === '/' 
                  ? 'text-kumbh-orange bg-orange-50' 
                  : 'text-gray-700 hover:text-kumbh-orange hover:bg-orange-50 hover:scale-105'
              }`}
            >
              Home
            </button>
            
            {/* Stay Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStayDropdownOpen(!isStayDropdownOpen)}
                onMouseEnter={() => setIsStayDropdownOpen(true)}
                className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg flex items-center space-x-1 ${
                  location === '/hotel-booking'
                    ? 'text-kumbh-orange bg-orange-50'
                    : 'text-gray-700 hover:text-kumbh-orange hover:bg-orange-50 hover:scale-105'
                }`}
              >
                <span>Stay</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isStayDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isStayDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setIsStayDropdownOpen(false)}
                >
                  <button
                    onClick={() => { setLocation('/hotel-booking'); setIsStayDropdownOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-kumbh-light hover:text-kumbh-orange hover:pl-5 transition-all duration-200 rounded-md mx-1"
                  >
                    🏨 Hotels
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => handleNavigation('/medical-services')}
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                location === '/medical-services' 
                  ? 'text-kumbh-orange bg-orange-50' 
                  : 'text-gray-700 hover:text-kumbh-orange hover:bg-orange-50 hover:scale-105'
              }`}
            >
              Health
            </button>
            
            {/* Travel Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTravelDropdownOpen(!isTravelDropdownOpen)}
                onMouseEnter={() => setIsTravelDropdownOpen(true)}
                className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg flex items-center space-x-1 ${
                  location.startsWith('/transport') || location === '/navigation' 
                    ? 'text-kumbh-orange bg-orange-50' 
                    : 'text-gray-700 hover:text-kumbh-orange hover:bg-orange-50 hover:scale-105'
                }`}
              >
                <span>Travel</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isTravelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isTravelDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setIsTravelDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleNavigation('/transport/testing')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-kumbh-light hover:text-kumbh-orange hover:pl-5 transition-all duration-200 rounded-md mx-1"
                  >
                    Testing Module
                  </button>
                  <button
                    onClick={() => handleNavigation('/complete-navigation')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-kumbh-light hover:text-kumbh-orange hover:pl-5 transition-all duration-200 rounded-md mx-1"
                  >
                    Complete Navigation
                  </button>
                  <button
                    onClick={() => handleNavigation('/transport/to-city')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-kumbh-light hover:text-kumbh-orange hover:pl-5 transition-all duration-200 rounded-md mx-1"
                  >
                    Transport to the City
                  </button>
                  <button
                    onClick={() => handleNavigation('/transport/in-city')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-kumbh-light hover:text-kumbh-orange hover:pl-5 transition-all duration-200 rounded-md mx-1"
                  >
                    Transport in the City
                  </button>
                  <button
                    onClick={() => handleNavigation('/navigation')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-kumbh-light hover:text-kumbh-orange hover:pl-5 transition-all duration-200 rounded-md mx-1"
                  >
                    Navigation
                  </button>
                </div>
              )}
            </div>
            </nav>

            {/* Auth, Language Toggle and SOS Button */}
            <div className="flex items-center space-x-3">
              {/* Auth Buttons */}
              {isAuthenticated() ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 bg-kumbh-light text-kumbh-text px-3 py-2 rounded-full text-sm font-medium border border-kumbh-orange hover:bg-kumbh-orange hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                    <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                    <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setLocation('/profile');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-kumbh-light hover:text-kumbh-orange transition-colors"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setLocation('/my-bookings');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-kumbh-light hover:text-kumbh-orange transition-colors"
                      >
                        My Bookings
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200 mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setLocation('/login')}
                    className="bg-white text-kumbh-orange px-4 py-2 rounded-full text-sm font-medium border border-kumbh-orange hover:bg-kumbh-light transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setLocation('/signup')}
                    className="bg-kumbh-orange text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-kumbh-deep transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              
              <button 
                onClick={toggleLanguage}
                className="bg-kumbh-light text-kumbh-text px-3 py-1 rounded-full text-sm font-medium border border-kumbh-orange hover:bg-kumbh-orange hover:text-white transition-colors"
                data-testid="button-language-toggle"
              >
                {t('nav.language')}
              </button>
              
              <button 
                onClick={onSOSClick}
                className="sos-pulse bg-kumbh-emergency text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-red-600 transition-all"
                data-testid="button-sos-header"
              >
                {t('nav.sos')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
