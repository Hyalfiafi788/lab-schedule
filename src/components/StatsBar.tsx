"use client";

import { BOOKINGS, LABS } from "@/lib/data";
import { CalendarCheck, FlaskConical, Users, TrendingUp } from "lucide-react";

export default function StatsBar() {
  const totalSessions = BOOKINGS.length;
  const totalLabs = LABS.length;
  const totalCapacity = LABS.reduce((sum, l) => sum + l.capacity, 0);
  const avgUtilization = Math.round(
    LABS.reduce((sum, l) => {
      const bookings = BOOKINGS.filter((b) => b.labId === l.id);
      const totalSlots = 5 * 11;
      const usedSlots = bookings.reduce((s, b) => {
        const start = parseInt(b.startTime.split(":")[0]);
        const end = parseInt(b.endTime.split(":")[0]);
        return s + (end - start);
      }, 0);
      return sum + (usedSlots / totalSlots) * 100;
    }, 0) / LABS.length
  );

  const stats = [
    {
      label: "Weekly Sessions",
      value: totalSessions,
      icon: <CalendarCheck size={18} className="text-blue-600" />,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Active Labs",
      value: totalLabs,
      icon: <FlaskConical size={18} className="text-violet-600" />,
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
    {
      label: "Total Capacity",
      value: `${totalCapacity} seats`,
      icon: <Users size={18} className="text-emerald-600" />,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Avg. Utilization",
      value: `${avgUtilization}%`,
      icon: <TrendingUp size={18} className="text-amber-600" />,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
            {stat.icon}
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
