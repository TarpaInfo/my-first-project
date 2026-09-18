import React from "react";
import { NavLink } from "react-router-dom";
import {
  Compass,
  LayoutDashboard,
  Truck,
  FileCheck2,
  Receipt,
  Users,
  Calendar,
  Mountain,
  Plane,
  Building2,
  FolderArchive,
  BarChart3,
  Settings,
} from "lucide-react";

const MENU_GROUPS = [
  {
    title: "Operations Hub",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { name: "Booking Registry", path: "/dashboard/bookings", icon: Calendar }, // <-- Dedicated trip bookings view
      { name: "Logistics Matrix", path: "/dashboard/logistics", icon: Truck },
      { name: "Permits & TIMS", path: "/dashboard/permits", icon: FileCheck2 },
      {
        name: "Financial Ledger",
        path: "/dashboard/financials",
        icon: Receipt,
      },
      {
        name: "Expeditions & History",
        path: "/dashboard/trips",
        icon: Compass,
      },
      {
        name: "Expeditions & Tours",
        path: "/dashboard/activities",
        icon: Mountain,
      },
    ],
  },
  {
    title: "Field Coordination",
    items: [
      { name: "Guides & Trekkers", path: "/dashboard/members", icon: Users },
      {
        name: "Departure Calendar",
        path: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        name: "Transport & Flights",
        path: "/dashboard/transport",
        icon: Plane,
      },
      { name: "Lodges & Camps", path: "/dashboard/hotels", icon: Building2 },
    ],
  },
  {
    title: "Management",
    items: [
      {
        name: "Document Vault",
        path: "/dashboard/documents",
        icon: FolderArchive,
      },
      {
        name: "Reports & Analytics",
        path: "/dashboard/reports",
        icon: BarChart3,
      },
      { name: "Settings", path: "/dashboard/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-50">
        <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
          <Compass size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-tight">
            Satori Adventures
          </h1>
          <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            Nepal Operations
          </p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {group.title}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-sky-50 text-sky-600"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Status Footnote */}
      <div className="p-4 border-t border-slate-50">
        <div className="px-3 py-2 bg-emerald-50 rounded-xl flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>API Connected (Port 8080)</span>
        </div>
      </div>
    </aside>
  );
}
