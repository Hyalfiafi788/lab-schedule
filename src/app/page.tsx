"use client";

import { useState } from "react";
import Header from "@/components/Header";
import LabCard from "@/components/LabCard";
import WeeklySchedule from "@/components/WeeklySchedule";
import BookingModal from "@/components/BookingModal";
import StatsBar from "@/components/StatsBar";
import { LABS, type Booking } from "@/lib/data";
import { LayoutGrid, Calendar, ChevronRight } from "lucide-react";

type View = "schedule" | "labs";

export default function Home() {
  const [selectedLabId, setSelectedLabId] = useState<string | undefined>();
  const [view, setView] = useState<View>("schedule");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const selectedLab = LABS.find((l) => l.id === selectedLabId);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAddBooking={() => setShowCreateModal(true)} />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <StatsBar />

        {/* View toggle & breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {selectedLab && (
              <>
                <button
                  onClick={() => setSelectedLabId(undefined)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  All Labs
                </button>
                <ChevronRight size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-900">{selectedLab.name}</span>
              </>
            )}
            {!selectedLab && (
              <h2 className="text-base font-semibold text-slate-900">Weekly Schedule</h2>
            )}
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView("schedule")}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                view === "schedule"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar size={14} />
              Schedule
            </button>
            <button
              onClick={() => setView("labs")}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                view === "labs"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid size={14} />
              Labs
            </button>
          </div>
        </div>

        {/* Main content */}
        {view === "schedule" ? (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar: Lab list */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                Filter by Lab
              </div>
              <button
                onClick={() => setSelectedLabId(undefined)}
                className={`w-full text-left rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                  !selectedLabId
                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                All Labs
              </button>
              {LABS.map((lab) => (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  selected={selectedLabId === lab.id}
                  onClick={() =>
                    setSelectedLabId(selectedLabId === lab.id ? undefined : lab.id)
                  }
                />
              ))}
            </div>

            {/* Schedule grid */}
            <div>
              <WeeklySchedule
                selectedLabId={selectedLabId}
                onBookingClick={setSelectedBooking}
              />
            </div>
          </div>
        ) : (
          /* Labs grid view */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {LABS.map((lab) => (
              <div
                key={lab.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Color band */}
                <div className="h-2" style={{ backgroundColor: lab.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{lab.name}</h3>
                      <p className="text-sm text-slate-500">{lab.location}</p>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: lab.color }}
                    >
                      Cap. {lab.capacity}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {lab.equipment.map((e) => (
                      <span key={e} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {e}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLabId(lab.id);
                      setView("schedule");
                    }}
                    className="w-full py-2 rounded-xl border text-sm font-medium transition-colors hover:text-white"
                    style={{
                      borderColor: lab.color,
                      color: lab.color,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = lab.color;
                      (e.currentTarget as HTMLButtonElement).style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = lab.color;
                    }}
                  >
                    View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking detail modal */}
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          mode="view"
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Create booking modal */}
      {showCreateModal && (
        <BookingModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSave={(data) => {
            console.log("New booking:", data);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
