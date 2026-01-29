"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { MENU_BY_ROLE } from "../utils/menuItems";

import { getTheRole } from "../store/selectors/userSelector";

type Props = {
  collapsed: boolean;
};

export default function Sidebar({ collapsed }: Props) {
  const pathname = usePathname();
  const role = useSelector(getTheRole);
  const menuItems = MENU_BY_ROLE[role];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)]
    overflow-visible z-50
    bg-linear-to-b from-[#0f172a] via-[#020617] to-[#020617]
    text-white transition-all duration-300 ease-in-out
    shadow-[4px_0_20px_rgba(0,0,0,0.4)]
    ${collapsed ? "w-16" : "w-64"}
  `}
    >
      <nav className="mt-4 space-y-1">
        {menuItems.map((item) => {
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group relative w-full flex items-center gap-3 px-4 py-3 my-1
  rounded-r-xl cursor-pointer transition-all duration-200
  ${
    active
      ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-md"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }
  
`}
            >
              <item.icon className="w-5 h-5" />

              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}

              {/* Tooltip */}
              {collapsed && (
                <span
                  className="
      absolute left-full ml-3
      top-1/2 -translate-y-1/2
      whitespace-nowrap
      bg-slate-900 text-white text-xs
      px-2 py-1 rounded
      shadow-lg
      opacity-0
      group-hover:opacity-100
      transition-opacity
      z-9999
      pointer-events-none
    "
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
