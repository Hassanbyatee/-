import React from 'react';
import { Check, Lock } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import type { CabinSeatId, SeatPricesMap } from '../types/domain';

interface CarCabinSeatSelectorProps {
  bookedSeats: CabinSeatId[];
  selectedSeats: CabinSeatId[];
  maxSelectable: number;
  seatPrices?: SeatPricesMap;
  onToggleSeat: (seatId: CabinSeatId) => void;
}

interface SeatMeta {
  id: CabinSeatId;
  label: string;
  compact?: boolean;
}

export const CarCabinSeatSelector: React.FC<CarCabinSeatSelectorProps> = ({
  bookedSeats,
  selectedSeats,
  maxSelectable,
  seatPrices,
  onToggleSeat,
}) => {
  const { formatIqd, t } = useI18n();

  const bookedSet = new Set<CabinSeatId>(bookedSeats);
  const selectedSet = new Set<CabinSeatId>(selectedSeats);

  const seatLabels: Record<CabinSeatId, string> = {
    front_passenger: t.booking.seatFrontPassenger,
    rear_right: t.booking.seatRearRight,
    rear_middle: t.booking.seatRearMiddle,
    rear_left: t.booking.seatRearLeft,
  };

  const selectedSubtotal = seatPrices
    ? selectedSeats.reduce((sum, id) => sum + (seatPrices[id] || 0), 0)
    : 0;

  const renderPassengerSeat = ({ id, label, compact = false }: SeatMeta) => {
    const isBooked = bookedSet.has(id);
    const isSelected = selectedSet.has(id);
    const limitReached = !isSelected && maxSelectable > 1 && selectedSeats.length >= maxSelectable;
    const priceIqd = seatPrices?.[id];

    return (
      <button
        key={id}
        type="button"
        disabled={isBooked || limitReached}
        onClick={() => onToggleSeat(id)}
        aria-pressed={isSelected}
        aria-label={`${label}${priceIqd ? ` - ${formatIqd(priceIqd)}` : ''} - ${
          isBooked ? t.booking.seatBooked : isSelected ? t.booking.seatSelected : t.booking.seatAvailable
        }`}
        className={`group relative flex flex-col items-center justify-between rounded-2xl border transition-all duration-200 select-none ${
          compact ? 'px-1.5 py-2.5 min-h-[108px]' : 'px-2.5 py-3 min-h-[116px]'
        } ${
          isBooked
            ? 'bg-slate-200/90 border-slate-300 text-slate-400 cursor-not-allowed shadow-inner opacity-85'
            : isSelected
            ? 'bg-[#0770E3] border-[#0559B8] text-white -translate-y-1.5 shadow-[0_7px_0_#054494,0_14px_24px_rgba(7,112,227,0.32)] cursor-pointer'
            : limitReached
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
            : 'bg-white border-slate-300 text-slate-800 shadow-[0_4px_0_#CBD5E1,0_6px_14px_rgba(5,32,60,0.06)] hover:-translate-y-1 hover:border-[#0770E3] hover:shadow-[0_6px_0_#93C5FD,0_10px_18px_rgba(7,112,227,0.16)] cursor-pointer'
        }`}
      >
        {/* 3D Headrest Cushion */}
        <span
          className={`w-9 h-2.5 rounded-full border transition-colors ${
            isBooked
              ? 'bg-slate-300 border-slate-400/50'
              : isSelected
              ? 'bg-[#3894FA] border-white/40'
              : 'bg-slate-100 border-slate-300 group-hover:border-[#93C5FD]'
          }`}
        />

        {/* Seat Backrest Bolster & Center Indicator */}
        <div
          className={`w-full flex-1 my-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 px-1 py-1.5 ${
            isBooked
              ? 'bg-slate-200/60 border-slate-300/80'
              : isSelected
              ? 'bg-[#055EC2]/60 border-white/25'
              : 'bg-slate-50/90 border-slate-200/80 group-hover:bg-[#EFF6FF]/60'
          }`}
        >
          {isBooked ? (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          ) : isSelected ? (
            <span className="w-5 h-5 rounded-full bg-white text-[#0770E3] flex items-center justify-center shadow-xs">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          ) : (
            <span className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-[#0770E3] transition-colors" />
          )}

          <span
            className={`text-[10.5px] font-bold leading-tight text-center ${
              isBooked ? 'text-slate-500' : isSelected ? 'text-white' : 'text-slate-800'
            }`}
          >
            {label}
          </span>

          {typeof priceIqd === 'number' && priceIqd > 0 && (
            <span
              className={`text-[10px] font-bold font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                isBooked
                  ? 'bg-slate-300/70 text-slate-500 line-through'
                  : isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-[#EFF6FF] text-[#0559B8]'
              }`}
            >
              {priceIqd.toLocaleString('en-US')} {t.currency}
            </span>
          )}
        </div>

        {/* Bottom Seat Lip */}
        <span
          className={`text-[9.5px] font-semibold tracking-wide ${
            isBooked ? 'text-slate-400' : isSelected ? 'text-blue-100' : 'text-slate-500'
          }`}
        >
          {isBooked
            ? t.booking.seatBooked
            : isSelected
            ? t.booking.seatSelected
            : t.booking.seatAvailable}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800">
          {t.booking.selectSeatsTitle}
        </label>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300 shadow-[0_2px_0_#CBD5E1]" />
            <span>{t.booking.seatAvailable}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#0770E3] border border-[#0559B8] shadow-[0_2px_0_#054494]" />
            <span>{t.booking.seatSelected}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
            <span>{t.booking.seatBooked}</span>
          </span>
        </div>
      </div>

      {/* 3D Perspective Top-Down Car Interior Diagram */}
      <div
        className="relative mx-auto max-w-[380px] pt-2 pb-3"
        style={{ perspective: '950px' }}
      >
        <div
          dir="ltr"
          className="relative mx-auto rounded-[44px] bg-[#05203C] p-2.5 shadow-[0_22px_40px_-14px_rgba(5,32,60,0.38),0_6px_0_#031528] border border-[#103863]"
          style={{ transform: 'rotateX(6deg)', transformStyle: 'preserve-3d' }}
        >
          {/* Left & Right Side Mirrors */}
          <div className="absolute -left-3.5 top-[25%] w-3.5 h-8 rounded-l-lg bg-[#05203C] border border-[#1E4775] shadow-sm" />
          <div className="absolute -right-3.5 top-[25%] w-3.5 h-8 rounded-r-lg bg-[#05203C] border border-[#1E4775] shadow-sm" />

          {/* Hood & Headlight accents */}
          <div className="flex items-center justify-between px-6 pb-2 pt-1">
            <span className="w-8 h-1.5 rounded-full bg-amber-200/80 shadow-[0_0_8px_rgba(253,230,138,0.65)]" />
            <span className="text-[10px] font-bold text-blue-100/90 tracking-wide">
              {t.booking.frontOfCar}
            </span>
            <span className="w-8 h-1.5 rounded-full bg-amber-200/80 shadow-[0_0_8px_rgba(253,230,138,0.65)]" />
          </div>

          {/* Tinted Front Windshield */}
          <div className="mx-2 h-8 rounded-t-[28px] rounded-b-lg bg-gradient-to-b from-[#1E4E86] via-[#133A68] to-[#0A2547] border-t border-white/25 border-x border-white/10 relative overflow-hidden">
            <div className="absolute inset-x-6 top-1 h-1 rounded-full bg-white/15" />
          </div>

          {/* Cabin Interior Floor */}
          <div className="mx-1 my-1.5 rounded-[24px] bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 border border-slate-300/80 p-3 space-y-3.5 shadow-inner">
            {/* FRONT ROW: Driver (Left) + Console + Front Passenger (Right) */}
            <div className="grid grid-cols-[1fr_36px_1fr] gap-2 items-stretch">
              {/* Driver Seat (Always Front-Left, Occupied) */}
              <div className="relative flex flex-col items-center justify-between rounded-2xl border border-slate-300 bg-[#05203C]/[0.08] px-2.5 py-2.5 min-h-[116px] text-slate-600 select-none">
                {/* Steering Wheel */}
                <div className="flex items-center justify-center w-full mb-1">
                  <svg
                    viewBox="0 0 36 22"
                    className="w-8 h-5 text-[#05203C]"
                    fill="none"
                    aria-hidden="true"
                  >
                    <ellipse cx="18" cy="11" rx="13" ry="8" stroke="currentColor" strokeWidth="2.6" />
                    <circle cx="18" cy="11" r="3" fill="currentColor" />
                    <path d="M6 11H15M21 11H30M18 14V19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="w-full flex-1 rounded-xl border border-slate-300/90 bg-slate-200/75 flex flex-col items-center justify-center px-1 py-1.5">
                  <span className="text-[11px] font-bold text-[#05203C]">
                    {t.booking.driverSeatLabel}
                  </span>
                </div>

                <span className="text-[10px] font-semibold text-slate-400 mt-1">
                  {t.booking.seatBooked}
                </span>
              </div>

              {/* Center Console / Gear Stick */}
              <div className="flex flex-col items-center justify-between py-2">
                <div className="w-7 h-10 rounded-lg bg-slate-200/90 border border-slate-300 flex flex-col items-center justify-center gap-1 shadow-xs">
                  <span className="w-3 h-3 rounded-full bg-[#05203C] border border-slate-400" />
                  <span className="w-3.5 h-0.5 rounded-full bg-slate-400" />
                </div>
                <div className="w-6 h-8 rounded-md bg-slate-200/80 border border-slate-300 shadow-inner" />
              </div>

              {/* Front Passenger Seat (Front-Right) */}
              {renderPassengerSeat({
                id: 'front_passenger',
                label: seatLabels.front_passenger,
              })}
            </div>

            {/* Subtle Row Divider / Footwell */}
            <div className="flex items-center gap-2 px-2">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="w-12 h-1.5 rounded-full bg-slate-200" />
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* REAR ROW: Rear Left + Rear Middle + Rear Right */}
            <div className="grid grid-cols-3 gap-2 items-stretch">
              {renderPassengerSeat({
                id: 'rear_left',
                label: seatLabels.rear_left,
                compact: true,
              })}
              {renderPassengerSeat({
                id: 'rear_middle',
                label: seatLabels.rear_middle,
                compact: true,
              })}
              {renderPassengerSeat({
                id: 'rear_right',
                label: seatLabels.rear_right,
                compact: true,
              })}
            </div>
          </div>

          {/* Tinted Rear Window */}
          <div className="mx-3 h-5 rounded-t-md rounded-b-[22px] bg-gradient-to-b from-[#0A2547] to-[#174070] border-b border-white/15" />

          {/* Rear Taillights */}
          <div className="flex items-center justify-between px-7 pt-1.5 pb-0.5">
            <span className="w-7 h-1.5 rounded-full bg-rose-500/85" />
            <span className="w-10 h-1 rounded-full bg-white/20" />
            <span className="w-7 h-1.5 rounded-full bg-rose-500/85" />
          </div>
        </div>
      </div>

      {/* Selected Seats & Subtotal Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-600">{t.booking.selectedSeatsLabel}:</span>
          {selectedSeats.length === 0 ? (
            <span className="text-rose-600 font-medium">{t.booking.selectAtLeastOneSeat}</span>
          ) : (
            <span className="font-bold text-[#0770E3]">
              {selectedSeats.map((id) => seatLabels[id]).join(' • ')} ({selectedSeats.length})
            </span>
          )}
        </div>
        {seatPrices && selectedSeats.length > 0 && (
          <span className="font-bold font-mono tabular-nums text-[#05203C]">
            {formatIqd(selectedSubtotal)}
          </span>
        )}
      </div>
    </div>
  );
};
