import { useLanguage } from '@/hooks/use-language';

export default function SOSModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleCallEmergency = () => {
    window.location.href = 'tel:108';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" data-testid="modal-sos">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div className="sos-pulse bg-red-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-red-600 mb-2" data-testid="text-sos-title">
          {t('sos.sent')}
        </h3>
        <p className="font-devanagari text-red-600 mb-4" data-testid="text-sos-subtitle">
          {t('sos.sent.hindi')}
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">Your emergency alert has been sent to:</p>
          <ul className="text-sm text-left space-y-1">
            <li>✅ Nearby police stations</li>
            <li>✅ Medical emergency teams</li>
            <li>✅ Kumbh security control room</li>
            <li>✅ Your emergency contacts</li>
          </ul>
          <p className="text-sm text-gray-700 mt-3">📍 Your exact location has been shared</p>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={handleCallEmergency}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            data-testid="button-call-emergency"
          >
            📞 Call Emergency Services
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            data-testid="button-close-sos-modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
