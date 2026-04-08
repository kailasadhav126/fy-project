import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { decodeParkingNameSlug, getParkingGridData } from '@/lib/parking-detail-data';
import { useAuth } from '@/hooks/use-auth';
import { createBookingRecord, requireLoginForBooking } from '@/lib/booking-flow';

const slotStyleByStatus = {
  available: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
  reserved: 'bg-yellow-50 border-yellow-200 text-yellow-700 cursor-not-allowed',
  blocked: 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed',
  occupied: 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed',
};

const SLOT_VALIDITY_MS = 30 * 60 * 1000;
const vehicleTypes = ['Car', 'Bus', 'Truck', 'Tempo', 'Auto Rickshaw', 'Two Wheeler'];

function formatSlotValidity(expiresAt, now) {
  if (!expiresAt) return 'Manual reservation';
  const remainingMs = Math.max(0, expiresAt - now);
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  return `${mins}:${String(secs).padStart(2, '0')} left`;
}

export default function ParkingDetail() {
  const { parkingName: parkingNameSlug } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, getToken } = useAuth();
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  const parkingName = useMemo(() => decodeParkingNameSlug(parkingNameSlug), [parkingNameSlug]);

  const [slots, setSlots] = useState([]);
  const [templateLabel, setTemplateLabel] = useState('');
  const [selectedAvailableSlot, setSelectedAvailableSlot] = useState('');
  const [selectedReservedSlot, setSelectedReservedSlot] = useState('');
  const [bookingForm, setBookingForm] = useState({ name: '', vehicleNumber: '', vehicleType: '', passengers: '1' });
  const [statusMessage, setStatusMessage] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    window.scrollTo(0, 0);
    const gridData = getParkingGridData(parkingName);
    setTemplateLabel(gridData.templateLabel);
    setSlots(gridData.slots);
    setSelectedAvailableSlot('');
    setSelectedReservedSlot('');
    setBookingForm({ name: '', vehicleNumber: '', vehicleType: '', passengers: '1' });
    setStatusMessage('');
  }, [parkingName]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const expiredSlots = slots.filter((slot) => slot.status === 'reserved' && slot.bookingExpiresAt && slot.bookingExpiresAt <= now);
    if (expiredSlots.length === 0) return;

    setSlots((prev) =>
      prev.map((slot) =>
        slot.status === 'reserved' && slot.bookingExpiresAt && slot.bookingExpiresAt <= now
          ? {
              ...slot,
              status: 'available',
              reservedFor: '',
              vehicleNumber: '',
              vehicleType: '',
              passengers: '',
              bookingExpiresAt: null,
            }
          : slot
      )
    );
    setStatusMessage(`${expiredSlots.length} expired reservation${expiredSlots.length > 1 ? 's' : ''} released automatically.`);
  }, [now, slots]);

  const counts = useMemo(
    () =>
      slots.reduce(
        (acc, slot) => {
          acc.total += 1;
          if (slot.status === 'available') acc.available += 1;
          if (slot.status === 'reserved') acc.reserved += 1;
          if (slot.status === 'blocked') acc.blocked += 1;
          if (slot.status === 'occupied') acc.occupied += 1;
          return acc;
        },
        { total: 0, available: 0, reserved: 0, blocked: 0, occupied: 0 }
      ),
    [slots]
  );

  const availableSlots = useMemo(() => slots.filter((slot) => slot.status === 'available'), [slots]);
  const reservedSlots = useMemo(() => slots.filter((slot) => slot.status === 'reserved'), [slots]);

  useEffect(() => {
    if (selectedAvailableSlot && !availableSlots.some((slot) => slot.id === selectedAvailableSlot)) {
      setSelectedAvailableSlot('');
    }
    if (selectedReservedSlot && !reservedSlots.some((slot) => slot.id === selectedReservedSlot)) {
      setSelectedReservedSlot('');
    }
  }, [availableSlots, reservedSlots, selectedAvailableSlot, selectedReservedSlot]);

  const reserveSlot = async (e) => {
    e.preventDefault();
    if (!requireLoginForBooking({
      isAuthenticated,
      setLocation,
      message: 'Please login first to book a parking slot. After login, you will return to this parking page.'
    })) {
      return;
    }

    const visitorName = bookingForm.name.trim();
    const vehicleNumber = bookingForm.vehicleNumber.trim().toUpperCase();
    const vehicleType = bookingForm.vehicleType;
    const passengerCount = Number(bookingForm.passengers);

    if (!visitorName || !vehicleNumber || !vehicleType || !passengerCount || passengerCount < 1) {
      alert('Please enter name, vehicle number, vehicle type, and passenger count.');
      return;
    }

    const targetSlotId = selectedAvailableSlot || availableSlots[0]?.id;
    if (!targetSlotId) {
      alert('No available slot left in this parking.');
      return;
    }

    const bookingExpiresAt = Date.now() + SLOT_VALIDITY_MS;

    try {
      const booking = await createBookingRecord({
        API_BASE,
        token: getToken(),
        bookingData: {
          bookingType: 'parking',
          status: 'pending',
          parkingDetails: {
            parkingName,
            slotId: targetSlotId,
            vehicleNumber,
            vehicleType,
            passengers: passengerCount,
            reservedFor: visitorName,
            validUntil: new Date(bookingExpiresAt)
          },
          contactDetails: {
            name: visitorName,
            phone: user?.phone || '',
            email: user?.email || ''
          },
          amount: 0,
          bookingDetails: {
            source: 'sector-specific-parking-grid',
            validityMinutes: 30
          }
        }
      });

      setStatusMessage(`Slot ${targetSlotId} reserved for ${visitorName}. Booking ID: ${booking.bookingId}. Valid for 30 minutes.`);
    } catch (error) {
      console.error('Parking booking error:', error);
      alert(error.message || 'Failed to create parking booking. Please try again.');
      return;
    }

    let didReserve = false;
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === targetSlotId && slot.status === 'available') {
          didReserve = true;
          return {
            ...slot,
            status: 'reserved',
            reservedFor: visitorName,
            vehicleNumber,
            vehicleType,
            passengers: passengerCount,
            bookingExpiresAt,
          };
        }
        return slot;
      })
    );

    if (didReserve) {
      setSelectedAvailableSlot('');
      setSelectedReservedSlot(targetSlotId);
    }
  };

  const markReservedAsParked = () => {
    const targetSlotId = selectedReservedSlot || reservedSlots[0]?.id;
    if (!targetSlotId) {
      alert('No reserved slot available to mark as parked.');
      return;
    }

    let didPark = false;
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === targetSlotId && slot.status === 'reserved') {
          didPark = true;
          return {
            ...slot,
            status: 'occupied',
            bookingExpiresAt: null,
          };
        }
        return slot;
      })
    );

    if (didPark) {
      setSelectedReservedSlot('');
      setStatusMessage(`Vehicle marked as parked at slot ${targetSlotId}.`);
    }
  };

  const resetGrid = () => {
    const gridData = getParkingGridData(parkingName);
    setSlots(gridData.slots);
    setSelectedAvailableSlot('');
    setSelectedReservedSlot('');
    setBookingForm({ name: '', vehicleNumber: '', vehicleType: '', passengers: '1' });
    setStatusMessage('');
  };

  return (
    <div className="min-h-screen bg-kumbh-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="outline" onClick={() => setLocation('/complete-navigation')}>
            ← Back to Complete Navigation
          </Button>
          <Button variant="outline" onClick={() => setLocation('/sector-distribution')}>
            Sector Wise Distribution
          </Button>
          <Button variant="outline" onClick={() => setLocation('/parking')}>
            Main Parking Page
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-kumbh-text">{parkingName}</h1>
          <p className="text-sm text-gray-600 mt-2">
            Dedicated parking view with grid, slot status, and booking controls.
          </p>
          <p className="text-xs text-kumbh-orange font-semibold mt-1">Assigned layout: {templateLabel}</p>
          <p className="text-xs text-gray-500 mt-1">Reserved slots stay valid for 30 minutes, then release automatically if not marked parked.</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 border">
              <p className="text-xs text-gray-500">Total Slots</p>
              <p className="text-xl font-bold text-kumbh-text">{counts.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-100">
              <p className="text-xs text-gray-500">Available Slots</p>
              <p className="text-xl font-bold text-green-700">{counts.available}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
              <p className="text-xs text-gray-500">Blocked / Reserved</p>
              <p className="text-xl font-bold text-yellow-700">{counts.blocked + counts.reserved}</p>
              <p className="text-[11px] text-gray-500">Reserved: {counts.reserved} • Blocked: {counts.blocked}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs text-gray-500">Car Parked</p>
              <p className="text-xl font-bold text-red-700">{counts.occupied}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mt-4">
            <div className="flex items-center gap-1.5"><span>🟩</span><span>Available</span></div>
            <div className="flex items-center gap-1.5"><span>🚫</span><span>Reserved</span></div>
            <div className="flex items-center gap-1.5"><span>⛔</span><span>Blocked</span></div>
            <div className="flex items-center gap-1.5"><span>🚗</span><span>Car Parked</span></div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
            <form onSubmit={reserveSlot} className="grid grid-cols-1 md:grid-cols-6 gap-3 flex-1">
              <Input
                placeholder="Visitor name"
                value={bookingForm.name}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Vehicle number"
                value={bookingForm.vehicleNumber}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))}
              />
              <Select value={bookingForm.vehicleType} onValueChange={(value) => setBookingForm((prev) => ({ ...prev, vehicleType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                placeholder="Passengers"
                value={bookingForm.passengers}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, passengers: e.target.value }))}
              />
              <Select value={selectedAvailableSlot} onValueChange={setSelectedAvailableSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-assign available slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-kumbh-orange text-white hover:bg-kumbh-deep">
                Book Slot
              </Button>
            </form>

            <div className="flex gap-2">
              <Select value={selectedReservedSlot} onValueChange={setSelectedReservedSlot}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Reserved slot to park" />
                </SelectTrigger>
                <SelectContent>
                  {reservedSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.id} - {slot.vehicleNumber || 'Reserved'} - {formatSlotValidity(slot.bookingExpiresAt, now)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={markReservedAsParked} className="bg-green-600 text-white hover:bg-green-700">
                Mark Parked
              </Button>
              <Button variant="outline" onClick={resetGrid}>
                Reset Grid
              </Button>
            </div>
          </div>

          {statusMessage && (
            <p className="mt-4 text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {statusMessage}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-kumbh-text mb-4">Parking Grid</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {slots.map((slot) => {
              const isAvailable = slot.status === 'available';
              const isSelected = selectedAvailableSlot === slot.id;
              const displayIcon =
                slot.status === 'available' ? '🟩' : slot.status === 'reserved' ? '🚫' : slot.status === 'blocked' ? '⛔' : '🚗';

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => isAvailable && setSelectedAvailableSlot(slot.id)}
                  className={`h-16 rounded-lg border text-xs font-semibold px-1 transition-all ${
                    isAvailable && isSelected ? 'bg-green-200 border-green-600 text-green-900' : slotStyleByStatus[slot.status]
                  }`}
                  disabled={!isAvailable}
                  title={
                    slot.status === 'available'
                      ? `${slot.id} - Available`
                      : slot.status === 'reserved'
                        ? `${slot.id} - Reserved for ${slot.reservedFor || 'User'} (${slot.vehicleNumber || 'No vehicle'})`
                        : slot.status === 'blocked'
                          ? `${slot.id} - Blocked`
                          : `${slot.id} - Car parked (${slot.vehicleNumber || 'Vehicle'})`
                  }
                >
                  <div>{slot.id}</div>
                  <div className="text-base">{displayIcon}</div>
                  {slot.status === 'reserved' && (
                    <div className="text-[10px] leading-tight">
                      {slot.vehicleType || 'Vehicle'} | {slot.passengers || '?'} pax
                      <br />
                      {formatSlotValidity(slot.bookingExpiresAt, now)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
