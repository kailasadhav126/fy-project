import { useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickPrompts = [
  'Find parking',
  'Complete navigation',
  'Medical help',
  'Book stay',
];

function getBotReply(message) {
  const text = message.toLowerCase();

  if (text.includes('parking') || text.includes('park')) {
    return {
      text:
        'Parking guidance:\n' +
        '1. Complete Navigation detects your incoming sector from your location.\n' +
        '2. It shows that sector entry point, assigned outer/inner parkings, and ghat.\n' +
        '3. Click any parking dot on the sector map to open its dedicated slot grid and book a slot.',
      actions: [
        { label: 'Detect My Sector', path: '/complete-navigation' },
        { label: 'Open Parking Page', path: '/parking' },
      ],
    };
  }

  if (text.includes('navigation') || text.includes('route') || text.includes('sector') || text.includes('ghat')) {
    return {
      text:
        'Complete Navigation flow:\n' +
        '1. Fetch or simulate your location.\n' +
        '2. Analyze your route toward Nashik.\n' +
        '3. Match the route to the correct sector entry marker.\n' +
        '4. Show that sector route from green entry marker to its parking and ghat points.',
      actions: [{ label: 'Open Complete Navigation', path: '/complete-navigation' }],
    };
  }

  if (text.includes('medical') || text.includes('doctor') || text.includes('hospital') || text.includes('emergency')) {
    return {
      text:
        'Medical help:\n' +
        'Use Medical Services to view nearby hospitals and medical facilities. For urgent help, use the SOS/emergency section so the user can quickly call support.',
      actions: [
        { label: 'Open Medical Services', path: '/medical-services' },
        { label: 'Emergency Section', hash: 'emergency-section' },
      ],
    };
  }

  if (text.includes('stay') || text.includes('hotel') || text.includes('room')) {
    return {
      text:
        'Stay booking:\n' +
        'You can search hotels by location, check-in date, and number of guests. The hotel module shows verified stay options for pilgrims.',
      actions: [{ label: 'Open Stay Booking', path: '/hotel-booking' }],
    };
  }

  if (text.includes('transport') || text.includes('bus') || text.includes('train') || text.includes('cab')) {
    return {
      text:
        'Transport help:\n' +
        'You can check city transport, road/train/bus/cab options, and use Complete Navigation for sector-wise incoming route guidance.',
      actions: [
        { label: 'Open City Transport', path: '/transport/in-city' },
        { label: 'Complete Navigation', path: '/complete-navigation' },
      ],
    };
  }

  return {
    text:
      'I can help with:\n' +
      'Parking: sector-specific parking slots and booking.\n' +
      'Navigation: location to sector entry, then sector entry to ghat.\n' +
      'Medical: hospitals and emergency help.\n' +
      'Stay: hotel booking.\n' +
      'Transport: city and incoming transport options.',
    actions: [{ label: 'Complete Navigation', path: '/complete-navigation' }],
  };
}

export default function ChatbotWidget() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Namaste. I am your Kumbh Sahyogi assistant. How can I help you today?',
      actions: [
        { label: 'Find Parking', path: '/parking' },
        { label: 'Complete Navigation', path: '/complete-navigation' },
      ],
    },
  ]);

  const goToAction = (action) => {
    if (action.path) {
      setLocation(action.path);
      setIsOpen(false);
      return;
    }

    if (action.hash) {
      document.getElementById(action.hash)?.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const sendMessage = (messageText = input) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const reply = getBotReply(trimmed);
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'bot', text: reply.text, actions: reply.actions },
    ]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <style>{`
        @keyframes chatbot-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes chatbot-glow {
          0%, 100% { box-shadow: 0 14px 35px rgba(154, 52, 18, 0.55), 0 0 0 6px rgba(251, 146, 60, 0.25); }
          50% { box-shadow: 0 18px 48px rgba(154, 52, 18, 0.78), 0 0 0 10px rgba(251, 146, 60, 0.32); }
        }

        @keyframes chatbot-pop {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.92; }
        }

        .chatbot-float {
          animation: chatbot-float 2.8s ease-in-out infinite, chatbot-glow 2.8s ease-in-out infinite;
        }

        .chatbot-pop {
          animation: chatbot-pop 1.8s ease-in-out infinite;
        }
      `}</style>

      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-2xl">
          <div className="relative flex items-center justify-between overflow-hidden bg-orange-700 px-4 py-3 text-white">
            <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-yellow-300/25" />
            <div className="absolute bottom-0 right-12 h-10 w-10 rounded-full bg-yellow-200/20" />
            <div className="flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <span className="absolute h-9 w-9 rounded-full bg-white/20 animate-ping" />
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Kumbh Sahyogi Bot</p>
                <p className="text-xs text-white/80">Parking, route, stay, medical</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/20"
              aria-label="Close chatbot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto bg-orange-50/40 p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    message.role === 'user'
                      ? 'bg-kumbh-orange text-white'
                      : 'border border-orange-100 bg-white text-kumbh-text'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  {message.role === 'bot' && message.actions?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => goToAction(action)}
                          className="rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-bold text-kumbh-orange hover:bg-orange-200"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-orange-100 bg-white p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-kumbh-text hover:bg-orange-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about route, parking..."
                className="h-10 text-sm"
              />
              <Button type="submit" className="h-10 bg-kumbh-orange px-3 text-white hover:bg-kumbh-deep">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-yellow-300 bg-orange-700 text-white shadow-2xl transition-transform hover:scale-105 hover:bg-orange-800 ${isOpen ? '' : 'chatbot-float'}`}
        aria-label="Open chatbot"
        style={{ color: '#ffffff' }}
      >
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-orange-600/50 animate-ping" />
            <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
          </>
        )}
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}
