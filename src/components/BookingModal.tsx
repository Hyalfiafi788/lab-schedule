"use client";

import { useState } from "react";
import { X, Clock, User, BookOpen, FlaskConical, MapPin, Wrench, ChevronDown } from "lucide-react";
import { type Booking, type Lab, LABS, getLabById } from "@/lib/data";

interface BookingModalProps {
  booking?: Booking | null;
  onClose: () => void;
  onSave?: (booking: Partial<Booking>) => void;
  mode: "view" | "create";
}

const DAYS_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function BookingModal({ booking, onClose, onSave, mode }: BookingModalProps) {
  const lab = booking ? getLabById(booking.labId) : null;

  const [form, setForm] = useState<Partial<Booking>>(
    mode === "create"
      ? { dayOfWeek: 0, startTime: "09:00", endTime: "11:00", recurrence: "weekly" }
      : {}
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave?.(form);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: mode === "view" && lab
              ? `linear-gradient(135deg, ${lab.color}15, ${lab.color}30)`
              : "linear-gradient(135deg, #3b82f615, #8b5cf630)",
          }}
        >
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              {mode === "create" ? "New Booking" : booking?.title}
            </h2>
            {mode === "view" && booking && (
              <p className="text-sm text-slate-600">{booking.course}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/80 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        {mode === "view" && booking && lab ? (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={<Clock size={15} />} label="Time">
                {booking.startTime} – {booking.endTime}
              </InfoItem>
              <InfoItem icon={<span className="text-xs font-bold">Day</span>} label="Day">
                {DAYS_LABELS[booking.dayOfWeek]}
              </InfoItem>
              <InfoItem icon={<User size={15} />} label="Instructor">
                {booking.instructor}
              </InfoItem>
              <InfoItem icon={<BookOpen size={15} />} label="Course">
                {booking.course}
              </InfoItem>
              <InfoItem icon={<FlaskConical size={15} />} label="Lab">
                {lab.name}
              </InfoItem>
              <InfoItem icon={<MapPin size={15} />} label="Location">
                {lab.location}
              </InfoItem>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <Wrench size={13} />
                <span className="font-medium">Available Equipment</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lab.equipment.map((e) => (
                  <span key={e} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    {e}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: lab.color }}
              >
                Edit Booking
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Session Title</label>
              <input
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Intro to Biochemistry Lab"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lab</label>
                <div className="relative">
                  <select
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    value={form.labId || ""}
                    onChange={(e) => setForm({ ...form, labId: e.target.value })}
                  >
                    <option value="">Select lab</option>
                    {LABS.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Day</label>
                <div className="relative">
                  <select
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    value={form.dayOfWeek ?? 0}
                    onChange={(e) => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}
                  >
                    {DAYS_LABELS.map((d, i) => (
                      <option key={d} value={i}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Time</label>
                <input
                  type="time"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.startTime || "09:00"}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">End Time</label>
                <input
                  type="time"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.endTime || "11:00"}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Instructor</label>
                <input
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. ..."
                  value={form.instructor || ""}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Code</label>
                <input
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="BIO 301"
                  value={form.course || ""}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Save Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}
