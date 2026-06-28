"use client";

import { Lab, getLabUtilization, BOOKINGS } from "@/lib/data";
import { Users, MapPin, Wrench } from "lucide-react";

interface LabCardProps {
  lab: Lab;
  selected?: boolean;
  onClick?: () => void;
}

export default function LabCard({ lab, selected, onClick }: LabCardProps) {
  const utilization = getLabUtilization(lab.id);
  const bookingCount = BOOKINGS.filter((b) => b.labId === lab.id).length;

  const utilizationColor =
    utilization >= 75 ? "text-red-600 bg-red-50" :
    utilization >= 50 ? "text-amber-600 bg-amber-50" :
    "text-emerald-600 bg-emerald-50";

  const utilizationBarColor =
    utilization >= 75 ? "bg-red-500" :
    utilization >= 50 ? "bg-amber-500" :
    "bg-emerald-500";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 transition-all hover:shadow-md cursor-pointer ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: lab.color }}
          />
          <span className="font-semibold text-sm text-slate-900 leading-tight">{lab.name}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${utilizationColor}`}>
          {utilization}%
        </span>
      </div>

      {/* Utilization bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3">
        <div
          className={`h-full rounded-full transition-all ${utilizationBarColor}`}
          style={{ width: `${utilization}%` }}
        />
      </div>

      {/* Meta */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users size={12} className="flex-shrink-0" />
          <span>Capacity: {lab.capacity} students</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">{lab.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Wrench size={12} className="flex-shrink-0" />
          <span>{bookingCount} sessions/week</span>
        </div>
      </div>

      {/* Equipment tags */}
      <div className="mt-3 flex flex-wrap gap-1">
        {lab.equipment.slice(0, 3).map((e) => (
          <span key={e} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {e}
          </span>
        ))}
        {lab.equipment.length > 3 && (
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            +{lab.equipment.length - 3}
          </span>
        )}
      </div>
    </button>
  );
}
