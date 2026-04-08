import { useLanguage } from '@/hooks/use-language';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-kumbh-text text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* App Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-kumbh-orange text-white p-2 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 9.5V11.5L21 9ZM3 9L9 11.5V9.5L3 7V9ZM12 7.5C12.8 7.5 13.5 8.2 13.5 9S12.8 10.5 12 10.5 10.5 9.8 10.5 9 11.2 7.5 12 7.5Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold" data-testid="footer-title">{t('app.title')}</h3>
                <p className="font-devanagari text-sm text-gray-300">{t('app.title')}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {t('hero.description')}
            </p>
            <div className="flex space-x-3">
              <div className="bg-kumbh-orange p-2 rounded">
                <span className="text-xs font-semibold">Available 24/7</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services | सेवाएं</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#hotel-section" className="text-gray-300 hover:text-white transition-colors" data-testid="link-hotel-services">Hotel Booking</a></li>
              <li><a href="#medical-section" className="text-gray-300 hover:text-white transition-colors" data-testid="link-medical-services">Medical Services</a></li>
              <li><a href="#transport-section" className="text-gray-300 hover:text-white transition-colors" data-testid="link-transport-services">Transport Assistance</a></li>
              <li><a href="#emergency-section" className="text-gray-300 hover:text-white transition-colors" data-testid="link-emergency-services">Emergency SOS</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact | संपर्क</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300" data-testid="text-phone">📞 1800-123-4567</li>
              <li className="text-gray-300" data-testid="text-email">📧 help@kumbhsahyogi.in</li>
              <li className="text-gray-300" data-testid="text-address">📍 Kumbh Control Room, Nashik</li>
              <li className="text-gray-300">🕒 Available 24/7</li>
            </ul>
          </div>

          {/* Important Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Important | महत्वपूर्ण</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300">Emergency: 108, 100, 101</li>
              <li className="text-gray-300">Tourist Helpline: 1363</li>
              <li className="text-gray-300">Railway Enquiry: 139</li>
              <li className="text-gray-300">Women Helpline: 1091</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm" data-testid="text-copyright">
              © 2024 KumbhSahyogi. Built for Maha Kumbh 2026, Nashik. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors" data-testid="link-privacy">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors" data-testid="link-terms">Terms of Service</a>
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors" data-testid="link-support">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

