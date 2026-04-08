import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import ServiceCard from '@/components/service-card';
import TransportCard from '@/components/transport-card';
import StayCard from '@/components/stay-card';
import HotelCard from '@/components/hotel-card';
import MedicalFacilityCard from '@/components/medical-facility';
import TransportOption from '@/components/transport-option';
import ChatbotWidget from '@/components/chatbot-widget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockHotels, mockMedicalFacilities, mockTransportRoutes, mockEmergencyContacts } from '@/lib/mock-data';
import { useLocation } from 'wouter';

export default function Home({ onSOSClick }) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    checkin: '',
    guests: ''
  });
  const [routeFilters, setRouteFilters] = useState({
    from: '',
    to: ''
  });

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHotelBook = (hotelId) => {
    console.log('Booking hotel:', hotelId);
    setLocation('/hotel-booking');
  };

  const handleGetDirections = (facilityId) => {
    console.log('Getting directions to:', facilityId);
    setLocation('/medical-services');
  };

  const handleCallEmergency = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSearchHotels = (e) => {
    e.preventDefault();
    console.log('Searching hotels with filters:', searchFilters);
    setLocation('/hotel-booking');
  };

  const handlePlanRoute = (e) => {
    e.preventDefault();
    console.log('Planning route:', routeFilters);
    
    // Store route data for navigation page
    const routeData = {
      from: routeFilters.from,
      to: routeFilters.to,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('plannedRoute', JSON.stringify(routeData));
    setLocation('/navigation');
  };

  const handleTransportToCity = () => {
    setLocation('/transport/to-city');
  };

  const handleTransportInCity = () => {
    setLocation('/transport/in-city');
  };

  const handleNavigation = () => {
    setLocation('/navigation');
  };

  const handleCompleteNavigation = () => {
    setLocation('/complete-navigation');
  };

  const handleTestingModule = () => {
    setLocation('/transport/testing');
  };

  return (
    <div className="min-h-screen bg-kumbh-bg">
      {/* Hero Section */}
      <section className="hero-pattern bg-gradient-to-br from-kumbh-light to-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Image */}
            <div className="relative mb-8 rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="/assets/hero-image.jpg" 
                alt="Nashik Kumbh Mela - Sacred Godavari River with pilgrims and temples" 
                className="w-full h-48 sm:h-64 object-cover"
                data-testid="img-hero-kumbh"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-xl sm:text-2xl font-bold" data-testid="text-hero-event">
                    Maha Kumbh 2026, Nashik
                  </h2>
                  <p className="text-sm sm:text-base font-devanagari" data-testid="text-hero-visitors">
                    100+ million visitors expected
                  </p>
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-kumbh-text mb-4" data-testid="text-hero-welcome">
              {t('hero.welcome')}
              <br />
              <span className="text-lg sm:text-2xl font-devanagari text-kumbh-orange">
                {t('hero.welcome.hindi')}
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-700 mb-8 max-w-3xl mx-auto" data-testid="text-hero-description">
              {t('hero.description')}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl shadow-md" data-testid="stat-hotels">
                <div className="text-2xl font-bold text-kumbh-orange">500+</div>
                <div className="text-sm text-gray-600">Hotels</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md" data-testid="stat-medical">
                <div className="text-2xl font-bold text-kumbh-orange">100+</div>
                <div className="text-sm text-gray-600">Medical Centers</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md" data-testid="stat-transport">
                <div className="text-2xl font-bold text-kumbh-orange">50+</div>
                <div className="text-sm text-gray-600">Transport Hubs</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md" data-testid="stat-emergency">
                <div className="text-2xl font-bold text-kumbh-orange">24/7</div>
                <div className="text-sm text-gray-600">Emergency Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-kumbh-text mb-4" data-testid="text-services-title">
              {t('services.title')} | <span className="font-devanagari">{t('services.title.hindi')}</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find all the services you need during your pilgrimage. Tap on any service below to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StayCard
              title="Stay"
              titleHindi={t('hotel.title.hindi')}
              description="Find verified accommodations near your location"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              }
              onHotelsClick={() => setLocation('/hotel-booking')}
              badge="500+ Hotels"
              gradientFrom="from-orange-50"
              gradientTo="to-orange-100"
              borderColor="border-orange-200"
              iconBg="bg-kumbh-orange"
              badgeColor="bg-kumbh-orange"
              testId="service-hotel"
            />

            <ServiceCard
              title={t('medical.title')}
              titleHindi={t('medical.title.hindi')}
              description="Locate hospitals and medical camps nearby"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              }
              onClick={() => setLocation('/medical-services')}
              badge="100+ Centers"
              gradientFrom="from-red-50"
              gradientTo="to-red-100"
              borderColor="border-red-200"
              iconBg="bg-red-600"
              badgeColor="bg-red-600"
              testId="service-medical"
            />

            <TransportCard
              title={t('transport.title')}
              titleHindi={t('transport.title.hindi')}
              description="Real-time transport info and navigation"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              }
              badge="50+ Routes"
              gradientFrom="from-blue-50"
              gradientTo="to-blue-100"
              borderColor="border-blue-200"
              iconBg="bg-blue-600"
              badgeColor="bg-blue-600"
              testId="service-transport"
              onToCityClick={handleTransportToCity}
              onInCityClick={handleTransportInCity}
              onNavigationClick={handleNavigation}
              onCompleteNavigationClick={handleCompleteNavigation}
              onTestingClick={handleTestingModule}
            />

            <ServiceCard
              title={t('emergency.title')}
              titleHindi={t('emergency.title.hindi')}
              description="24/7 emergency assistance with location sharing"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              }
              onClick={() => scrollToSection('emergency-section')}
              badge="24/7 Active"
              gradientFrom="from-red-50"
              gradientTo="to-red-100"
              borderColor="border-kumbh-emergency"
              iconBg="bg-kumbh-emergency"
              badgeColor="bg-kumbh-emergency"
              testId="service-emergency"
            />
          </div>
        </div>
      </section>

      {/* Hotel Booking Section */}
      <section id="hotel-section" className="py-12 bg-kumbh-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-kumbh-text mb-2" data-testid="text-hotel-section-title">
              {t('hotel.title')} | <span className="font-devanagari">{t('hotel.title.hindi')}</span>
            </h2>
            <p className="text-gray-700">Find and book verified accommodations near the Kumbh venues</p>
          </div>

          {/* Search Form */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleSearchHotels}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('search.location')} | {t('search.location.hindi')}
                </label>
                <Select value={searchFilters.location} onValueChange={(value) => setSearchFilters({...searchFilters, location: value})}>
                  <SelectTrigger data-testid="select-hotel-location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ramkund">Near Ramkund</SelectItem>
                    <SelectItem value="panchavati">Near Panchavati</SelectItem>
                    <SelectItem value="tapovan">Near Tapovan</SelectItem>
                    <SelectItem value="railway">Near Railway Station</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('search.checkin')} | {t('search.checkin.hindi')}
                </label>
                <Input 
                  type="date" 
                  value={searchFilters.checkin}
                  onChange={(e) => setSearchFilters({...searchFilters, checkin: e.target.value})}
                  data-testid="input-hotel-checkin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('search.guests')} | {t('search.guests.hindi')}
                </label>
                <Select value={searchFilters.guests} onValueChange={(value) => setSearchFilters({...searchFilters, guests: value})}>
                  <SelectTrigger data-testid="select-hotel-guests">
                    <SelectValue placeholder="Number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3-4">3-4 Guests</SelectItem>
                    <SelectItem value="5+">5+ Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                  data-testid="button-search-hotels"
                >
                  Search Hotels
                </Button>
              </div>
            </form>
          </div>

          {/* Hotel Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockHotels.map((hotel) => (
              <HotelCard 
                key={hotel.id} 
                hotel={hotel} 
                onBook={handleHotelBook}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Medical Services Section */}
      <section id="medical-section" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-kumbh-text mb-2" data-testid="text-medical-section-title">
              {t('medical.title')} | <span className="font-devanagari">{t('medical.title.hindi')}</span>
            </h2>
            <p className="text-gray-700">Find nearby hospitals, medical camps, and emergency healthcare</p>
          </div>

          {/* Emergency Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {mockEmergencyContacts.slice(1, 4).map((contact, index) => {
              const colors = [
                { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-600', text: 'text-red-600' },
                { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', text: 'text-blue-600' },
                { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-600', text: 'text-green-600' }
              ];
              const color = colors[index];
              
              return (
                <div key={contact.id} className={`${color.bg} border-2 ${color.border} p-6 rounded-2xl text-center`} data-testid={`card-emergency-${contact.id}`}>
                  <div className={`${color.icon} text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <h3 className={`font-bold ${color.text} mb-2`} data-testid={`text-emergency-name-${contact.id}`}>
                    {contact.name}
                  </h3>
                  <p className="font-devanagari text-sm mb-3">{contact.name}</p>
                  <p className={`text-2xl font-bold ${color.text} mb-2`} data-testid={`text-emergency-phone-${contact.id}`}>
                    {contact.phone}
                  </p>
                  <Button 
                    onClick={() => handleCallEmergency(contact.phone)}
                    className={`${color.icon} text-white w-full hover:opacity-90`}
                    data-testid={`button-call-emergency-${contact.id}`}
                  >
                    {t('button.call')}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Medical Facilities List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-kumbh-text mb-6">
              Nearby Medical Facilities | पास की चिकित्सा सुविधाएं
            </h3>
            
            <div className="space-y-4">
              {mockMedicalFacilities.map((facility) => (
                <MedicalFacilityCard 
                  key={facility.id} 
                  facility={facility} 
                  onGetDirections={handleGetDirections}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transport Section */}
      <section id="transport-section" className="py-12 bg-kumbh-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-kumbh-text mb-2" data-testid="text-transport-section-title">
              {t('transport.title')} | <span className="font-devanagari">{t('transport.title.hindi')}</span>
            </h2>
            <p className="text-gray-700">Real-time transport information and navigation support</p>
          </div>

          {/* Transport Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[
              { name: 'Testing Module', hindi: 'Testing Module', desc: 'Smooth guided transport flow', status: 'Testing', color: 'bg-orange-100 text-orange-600', link: '/transport/testing' },
              { name: 'Shuttle Buses', hindi: 'शटल बसें', desc: 'Free shuttles between major ghats', status: '�︢ Active', color: 'bg-yellow-100 text-yellow-600', link: null },
              { name: 'Local Trains', hindi: 'स्थानीय ट्रेनें', desc: 'Connect to Mumbai & Pune', status: '�︢ Running', color: 'bg-blue-100 text-blue-600', link: null },
              { name: 'Parking', hindi: 'पार्किंग', desc: 'Book parking spaces', status: '�︢ Available', color: 'bg-purple-100 text-purple-600', link: '/parking' },
              { name: 'Auto Rickshaw', hindi: 'ऑटो रिक्शा', desc: 'Short distance travel', status: '�︢ Available', color: 'bg-green-100 text-green-600', link: null }
            ].map((option, index) => (
              <div 
                key={index} 
                className={`bg-white p-6 rounded-2xl shadow-lg text-center ${
                  option.link ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
                }`}
                data-testid={`card-transport-option-${index}`}
                onClick={() => option.link && setLocation(option.link)}
              >
                <div className={`${option.color} p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                  {option.name === 'Testing Module' ? (
                    <span className="text-2xl font-bold">T</span>
                  ) : option.link ? (
                    <span className="text-3xl">🅿️</span>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  )}
                </div>
                <h3 className="font-bold mb-2" data-testid={`text-transport-option-name-${index}`}>
                  {option.name}
                </h3>
                <p className="font-devanagari text-sm text-kumbh-orange mb-2">
                  {option.hindi}
                </p>
                <p className="text-gray-600 text-sm">{option.desc}</p>
                <div className="mt-3">
                  <span className="text-green-600 text-sm font-semibold">{option.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Route Planner */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-kumbh-text mb-6">
              Plan Your Route | अपना मार्ग योजना बनाएं
            </h3>
            
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" onSubmit={handlePlanRoute}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">From | से</label>
                <Select value={routeFilters.from} onValueChange={(value) => setRouteFilters({...routeFilters, from: value})}>
                  <SelectTrigger data-testid="select-route-from">
                    <SelectValue placeholder="Select starting point" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Location</SelectItem>
                    <SelectItem value="ramkund">Ramkund Ghat</SelectItem>
                    <SelectItem value="panchavati">Panchavati</SelectItem>
                    <SelectItem value="railway">Railway Station</SelectItem>
                    <SelectItem value="bus">Bus Stand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To | तक</label>
                <Select value={routeFilters.to} onValueChange={(value) => setRouteFilters({...routeFilters, to: value})}>
                  <SelectTrigger data-testid="select-route-to">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ramkund">Ramkund Ghat</SelectItem>
                    <SelectItem value="panchavati">Panchavati</SelectItem>
                    <SelectItem value="tapovan">Tapovan</SelectItem>
                    <SelectItem value="nashik-road">Nashik Road Station</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep"
                  data-testid="button-plan-route"
                >
                  Get Directions
                </Button>
              </div>
            </form>

            {/* Route Results */}
            <div className="space-y-4">
              {mockTransportRoutes.map((route) => (
                <TransportOption key={route.id} route={route} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Services Section */}
      <section id="emergency-section" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-kumbh-text mb-2" data-testid="text-emergency-section-title">
              {t('emergency.title')} | <span className="font-devanagari">{t('emergency.title.hindi')}</span>
            </h2>
            <p className="text-gray-700">24/7 emergency assistance with instant location sharing</p>
          </div>

          {/* Emergency SOS Button */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 mb-8 text-center text-white">
            <div className="mb-6">
              <div className="sos-pulse bg-white text-red-600 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2" data-testid="text-emergency-sos-title">
                {t('emergency.title')}
              </h3>
              <p className="font-devanagari text-lg mb-4" data-testid="text-emergency-sos-hindi">
                {t('emergency.title.hindi')}
              </p>
              <p className="text-red-100 mb-6">
                Press the button below to instantly alert nearby help centers with your exact location
              </p>
            </div>
            
            <Button
              onClick={onSOSClick}
              className="sos-pulse bg-white text-red-600 text-xl font-bold py-4 px-8 rounded-full shadow-lg hover:bg-red-50 transition-all transform hover:scale-105"
              data-testid="button-sos-main"
            >
              🚨 SEND SOS ALERT
            </Button>
            
            <p className="text-red-100 text-sm mt-4">
              Emergency services will be notified immediately
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mockEmergencyContacts.map((contact, index) => {
              const colors = [
                { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-600', text: 'text-red-600' },
                { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', text: 'text-blue-600' },
                { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', text: 'text-blue-600' },
                { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-600', text: 'text-green-600' }
              ];
              const color = colors[index] || colors[0];
              
              return (
                <div key={contact.id} className={`${color.bg} border-2 ${color.border} p-6 rounded-2xl`} data-testid={`card-emergency-contact-${contact.id}`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`${color.icon} text-white p-3 rounded-full`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold ${color.text}`} data-testid={`text-emergency-contact-name-${contact.id}`}>
                        {contact.name}
                      </h3>
                      <p className="font-devanagari text-sm">{contact.name}</p>
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${color.text} mb-2`} data-testid={`text-emergency-contact-phone-${contact.id}`}>
                    {contact.phone}
                  </p>
                  <Button 
                    onClick={() => handleCallEmergency(contact.phone)}
                    className={`${color.icon} text-white w-full hover:opacity-90`}
                    data-testid={`button-call-contact-${contact.id}`}
                  >
                    {t('button.call')}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Safety Tips */}
          <div className="bg-kumbh-light rounded-2xl p-6">
            <h3 className="text-xl font-bold text-kumbh-text mb-4">Safety Tips | सुरक्षा सुझाव</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Share your location with family', desc: 'Keep your family updated about your whereabouts' },
                { title: 'Keep important documents safe', desc: 'Carry copies and store originals securely' },
                { title: 'Stay in groups', desc: 'Avoid traveling alone, especially at night' },
                { title: 'Stay hydrated', desc: 'Drink water regularly and avoid outside food' }
              ].map((tip, index) => (
                <div key={index} className="flex items-start space-x-3" data-testid={`tip-safety-${index}`}>
                  <div className="bg-kumbh-orange text-white p-2 rounded-full flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-kumbh-text" data-testid={`text-tip-title-${index}`}>
                      {tip.title}
                    </p>
                    <p className="text-sm text-gray-600" data-testid={`text-tip-desc-${index}`}>
                      {tip.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <ChatbotWidget />
    </div>
  );
}

