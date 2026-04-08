import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    'app.title': 'KumbhSahyogi',
    'app.subtitle': 'Service Finder for Maha Kumbh 2026',
    'app.subtitle.hindi': 'महाकुंभ 2026',
    'nav.language': 'हिंदी | EN',
    'nav.sos': '🚨 SOS',
    'hero.welcome': 'Welcome to KumbhSahyogi',
    'hero.welcome.hindi': 'कुंभसहयोगी में आपका स्वागत है',
    'hero.description': 'Your trusted companion for finding essential services at Maha Kumbh 2026. Get real-time assistance for accommodation, medical care, transport, and emergency services.',
    'services.title': 'Essential Services',
    'services.title.hindi': 'आवश्यक सेवाएं',
    'hotel.title': 'Hotel Booking',
    'hotel.title.hindi': 'होटल बुकिंग',
    'medical.title': 'Medical Services',
    'medical.title.hindi': 'चिकित्सा सेवाएं',
    'transport.title': 'Transport',
    'transport.title.hindi': 'परिवहन सहायता',
    'emergency.title': 'Emergency SOS',
    'emergency.title.hindi': 'आपातकालीन सेवा',
    'button.book': 'Book Now',
    'button.directions': 'Get Directions',
    'button.call': 'Call Now',
    'search.location': 'Location',
    'search.location.hindi': 'स्थान',
    'search.checkin': 'Check-in',
    'search.checkin.hindi': 'आगमन',
    'search.guests': 'Guests',
    'search.guests.hindi': 'अतिथि',
    'sos.sent': 'SOS Alert Sent!',
    'sos.sent.hindi': 'SOS अलर्ट भेजा गया!'
  },
  hi: {
    'app.title': 'कुंभसहयोगी',
    'app.subtitle': 'महाकुंभ 2026 के लिए सेवा खोजक',
    'app.subtitle.hindi': 'Maha Kumbh 2026',
    'nav.language': 'EN | हिंदी',
    'nav.sos': '🚨 SOS',
    'hero.welcome': 'कुंभसहयोगी में आपका स्वागत है',
    'hero.welcome.hindi': 'Welcome to KumbhSahyogi',
    'hero.description': 'महाकुंभ 2026 में आवश्यक सेवाएं खोजने के लिए आपका विश्वसनीय साथी। आवास, चिकित्सा देखभाल, परिवहन और आपातकालीन सेवाओं के लिए वास्तविक समय सहायता प्राप्त करें।',
    'services.title': 'आवश्यक सेवाएं',
    'services.title.hindi': 'Essential Services',
    'hotel.title': 'होटल बुकिंग',
    'hotel.title.hindi': 'Hotel Booking',
    'medical.title': 'चिकित्सा सेवाएं',
    'medical.title.hindi': 'Medical Services',
    'transport.title': 'परिवहन सहायता',
    'transport.title.hindi': 'Transport',
    'emergency.title': 'आपातकालीन सेवा',
    'emergency.title.hindi': 'Emergency SOS',
    'button.book': 'अभी बुक करें',
    'button.directions': 'दिशा प्राप्त करें',
    'button.call': 'अभी कॉल करें',
    'search.location': 'स्थान',
    'search.location.hindi': 'Location',
    'search.checkin': 'आगमन',
    'search.checkin.hindi': 'Check-in',
    'search.guests': 'अतिथि',
    'search.guests.hindi': 'Guests',
    'sos.sent': 'SOS अलर्ट भेजा गया!',
    'sos.sent.hindi': 'SOS Alert Sent!'
  }
};

const LanguageContextProvider = createContext(undefined);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('kumbh-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('kumbh-language', newLanguage);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContextProvider.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContextProvider.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContextProvider);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
