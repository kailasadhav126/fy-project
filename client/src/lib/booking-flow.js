const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirect';

export function getCurrentBookingPath() {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search || ''}${window.location.hash || ''}`;
}

export function rememberBookingRedirect(path = getCurrentBookingPath()) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path || '/');
}

export function consumeBookingRedirect() {
  if (typeof window === 'undefined') return '';
  const redirectPath = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return redirectPath || '';
}

export function requireLoginForBooking({ isAuthenticated, setLocation, message = 'Please login first to continue your booking.' }) {
  if (typeof isAuthenticated === 'function' ? isAuthenticated() : Boolean(isAuthenticated)) {
    return true;
  }

  rememberBookingRedirect();
  alert(message);
  setLocation('/login');
  return false;
}

export async function createBookingRecord({ API_BASE, token, bookingData }) {
  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create booking');
  }

  return data.booking;
}
