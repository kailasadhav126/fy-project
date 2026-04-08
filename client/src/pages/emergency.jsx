import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { mockEmergencyContacts } from '@/lib/mock-data';

export default function Emergency({ onSOSClick }) {
  const { t } = useLanguage();

  const handleCallEmergency = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-kumbh-text mb-2" data-testid="text-page-title">
            {t('emergency.title')} | <span className="font-devanagari">{t('emergency.title.hindi')}</span>
          </h1>
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
            <h2 className="text-2xl font-bold mb-2" data-testid="text-sos-title">
              {t('emergency.title')}
            </h2>
            <p className="font-devanagari text-lg mb-4" data-testid="text-sos-hindi">
              {t('emergency.title.hindi')}
            </p>
            <p className="text-red-100 mb-6">
              Press the button below to instantly alert nearby help centers with your exact location
            </p>
          </div>
          
          <Button
            onClick={onSOSClick}
            className="sos-pulse bg-white text-red-600 text-xl font-bold py-4 px-8 rounded-full shadow-lg hover:bg-red-50 transition-all transform hover:scale-105"
            data-testid="button-sos-emergency-page"
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
                    <h3 className={`font-bold ${color.text}`} data-testid={`text-emergency-name-${contact.id}`}>
                      {contact.name}
                    </h3>
                    <p className="font-devanagari text-sm">{contact.name}</p>
                  </div>
                </div>
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

        {/* Emergency Instructions */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-red-600 mb-4">Emergency Instructions | आपातकालीन निर्देश</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-kumbh-text mb-3">In case of Medical Emergency:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Call 108 for immediate ambulance</li>
                <li>• Stay calm and provide clear location details</li>
                <li>• If conscious, keep the person sitting upright</li>
                <li>• Do not move severely injured persons</li>
                <li>• Keep emergency contacts handy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-kumbh-text mb-3">In case of Getting Lost:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Use the SOS button to share your location</li>
                <li>• Stay at a well-lit, crowded area</li>
                <li>• Contact Kumbh Helpdesk: 1800-123-4567</li>
                <li>• Look for police booths or volunteers</li>
                <li>• Keep identification documents safe</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-kumbh-light rounded-2xl p-6">
          <h3 className="text-xl font-bold text-kumbh-text mb-4">Safety Tips | सुरक्षा सुझाव</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                title: 'Share your location with family', 
                desc: 'Keep your family updated about your whereabouts',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                )
              },
              { 
                title: 'Keep important documents safe', 
                desc: 'Carry copies and store originals securely',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                )
              },
              { 
                title: 'Stay in groups', 
                desc: 'Avoid traveling alone, especially at night',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                )
              },
              { 
                title: 'Stay hydrated', 
                desc: 'Drink water regularly and avoid outside food',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                )
              },
              { 
                title: 'Know your medical conditions', 
                desc: 'Carry necessary medications and medical history',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                )
              },
              { 
                title: 'Avoid crowded areas during peak hours', 
                desc: 'Plan visits during off-peak times when possible',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )
              }
            ].map((tip, index) => (
              <div key={index} className="flex items-start space-x-3" data-testid={`tip-safety-${index}`}>
                <div className="bg-kumbh-orange text-white p-2 rounded-full flex-shrink-0">
                  {tip.icon}
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

        {/* Emergency Preparation Checklist */}
        <div className="bg-white border-2 border-kumbh-orange rounded-2xl p-6 mt-8">
          <h3 className="text-xl font-bold text-kumbh-text mb-4">Emergency Preparation Checklist | आपातकालीन तैयारी सूची</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-kumbh-orange mb-3">Before You Go:</h4>
              <div className="space-y-2 text-sm">
                {[
                  'Save emergency numbers in your phone',
                  'Share your itinerary with family',
                  'Pack essential medications',
                  'Carry identification documents',
                  'Download offline maps of the area'
                ].map((item, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer" data-testid={`checklist-before-${index}`}>
                    <input type="checkbox" className="rounded border-kumbh-orange text-kumbh-orange focus:ring-kumbh-orange" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-kumbh-orange mb-3">During Your Visit:</h4>
              <div className="space-y-2 text-sm">
                {[
                  'Keep your phone charged at all times',
                  'Stay aware of your surroundings',
                  'Follow crowd control instructions',
                  'Report suspicious activities',
                  'Use designated pathways and exits'
                ].map((item, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer" data-testid={`checklist-during-${index}`}>
                    <input type="checkbox" className="rounded border-kumbh-orange text-kumbh-orange focus:ring-kumbh-orange" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

