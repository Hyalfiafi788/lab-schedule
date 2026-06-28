"use client";

import { useState } from "react";
import { BOOKINGS, DAYS, SHORT_DAYS, HOURS, getLabById, type Booking } from "@/lib/data";
import { Clock, User, BookOpen, ChevronRight } from "lucide-react";

interface WeeklyScheduleProps {
  selectedLabId?: string;
  onBookingClick?: (booking: Booking) => void;
}

export default function WeeklySchedule({ selectedLabId, onBookingClick }: WeeklyScheduleProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredBookings = selectedLabId
    ? BOOKINGS.filter((b) => b.labId === selectedLabId)
    : BOOKINGS;

  function getBookingsForCell(day: number, hour: number): Booking[] {
    return filteredBookings.filter((b) => {
      const start = parseInt(b.startTime.split(":")[0]);
      const end = parseInt(b.endTime.split(":")[0]);
      return b.dayOfWeek === day && start <= hour && end > hour;
    });
  }

  function isStartOfBooking(booking: Booking, hour: number): boolean {
    return parseInt(booking.startTime.split(":")[0]) === hour;
  }

  function getBookingSpan(booking: Booking): number {
    const start = parseInt(booking.startTime.split(":")[0]);
    const end = parseInt(booking.endTime.split(":")[0]);
    return end - start;
  }

  const cellHeight = 64; // px per hour

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header row */}
      <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: "60px repeat(5, 1fr)" }}>
        <div className="h-12 border-r border-slate-100 bg-slate-50" />
        {DAYS.map((day, i) => (
          <div
            key={day}
            className="h-12 flex items-center justify-center border-r border-slate-100 last:border-r-0 bg-slate-50"
          >
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-600 hidden sm:block">{day}</div>
              <div className="text-xs font-semibold text-slate-600 sm:hidden">{SHORT_DAYS[i]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="overflow-auto scrollbar-thin" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <div className="grid relative" style={{ gridTemplateColumns: "60px repeat(5, 1fr)" }}>
          {/* Hour labels column */}
          <div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b border-slate-100 border-r border-r-slate-100 flex items-start justify-end pr-2 pt-1"
                style={{ height: cellHeight }}
              >
                <span className="text-xs text-slate-400 font-medium">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {Array.from({ length: 5 }, (_, dayIdx) => (
            <div key={dayIdx} className="relative border-r border-slate-100 last:border-r-0">
              {/* Hour grid lines */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-slate-100"
                  style={{ height: cellHeight }}
                />
              ))}

              {/* Bookings for this day */}
              {filteredBookings
                .filter((b) => b.dayOfWeek === dayIdx)
                .map((booking) => {
                  const startHour = parseInt(booking.startTime.split(":")[0]);
                  const endHour = parseInt(booking.endTime.split(":")[0]);
                  const offsetFromTop = (startHour - HOURS[0]) * cellHeight;
                  const height = (endHour - startHour) * cellHeight - 2;
                  const lab = getLabById(booking.labId);
                  const isHovered = hoveredId === booking.id;

                  return (
                    <button
                      key={booking.id}
                      onClick={() => onBookingClick?.(booking)}
                      onMouseEnter={() => setHoveredId(booking.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="absolute left-1 right-1 rounded-lg text-left transition-all z-10 overflow-hidden"
                      style={{
                        top: offsetFromTop + 1,
                        height,
                        backgroundColor: (booking.color || lab?.color || "#3b82f6") + "20",
                        borderLeft: `3px solid ${booking.color || lab?.color || "#3b82f6"}`,
                        transform: isHovered ? "scale(1.02)" : "scale(1)",
                        boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                      }}
                    >
                      <div className="px-2 py-1.5">
                        <div
                          className="text-xs font-semibold truncate leading-tight"
                          style={{ color: booking.color || lab?.color || "#3b82f6" }}
                        >
                          {booking.title}
                        </div>
                        {height > 48 && (
                          <>
                            <div className="text-xs text-slate-600 truncate mt-0.5 flex items-center gap-1">
                              <User size={10} className="flex-shrink-0" />
                              {booking.instructor}
                            </div>
                            <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <BookOpen size={10} className="flex-shrink-0" />
                              {booking.course}
                            </div>
                          </>
                        )}
                        {height > 96 && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} className="flex-shrink-0" />
                            {booking.startTime} – {booking.endTime}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
