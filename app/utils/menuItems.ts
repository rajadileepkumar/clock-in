import {
  HomeIcon,
  ClockIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserIcon,
  ChartBarIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";

export const MENU_BY_ROLE = {
  ADMIN: [
  { label: "Dashboard", path: "/dashboard", icon: HomeIcon },
  { label: "Users", path: "/dashboard/admin/users", icon: UserIcon },
  { label: "Approvals", path: "/dashboard/admin/approvals", icon: ShieldCheckIcon },
  { label: "Attendance", path: "/dashboard/admin/attendance", icon: CalendarIcon },
  { label: "Reports", path: "/dashboard/admin/reports", icon: ChartBarIcon },
  { label: "Configurations", path: "/dashboard/admin/configurations", icon: WrenchIcon },
  
],
  USER: [
    { label: "Dashboard", path: "/dashboard", icon: HomeIcon },
    { label: "History", path: "/dashboard/history", icon: ClockIcon },
  ],
};

