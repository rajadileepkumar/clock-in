"use client";

import { useRouter } from "next/navigation";
import {
  UserIcon,
  Bars4Icon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  useAppDispatch,
  useAppSelector,
} from "../store/selectors/userSelector";
import { clearUser } from "../store/slices/authSlice";

type Props = {
  collapsed: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ collapsed, onToggleSidebar }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Now these will work with updated slice
  const isClockedIn = useAppSelector((state) => state.timeTracking.isClockedIn); // Direct access

  const logout = () => {
    dispatch(clearUser());
    router.replace("/");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 shadow-md z-50 backdrop-blur bg-white/95">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="cursor-pointer text-xl hover:text-blue-600"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <Bars4Icon className="w-5 h-5" />
          ) : (
            <XMarkIcon className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-2 font-semibold">
          <div className="w-9 h-9 bg-blue-600 text-white rounded flex items-center justify-center">
            C
          </div>
          Clock-In
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {isClockedIn && (
          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            <ClockIcon className="w-4 h-4 inline-block mr-1" /> Clocked In
          </span>
        )}
        <span className="text-sm text-gray-600">
          Hi, <strong>{user?.full_name ?? "User"}</strong>
        </span>

        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
          <UserIcon className="w-5 h-5" />
        </div>

        <button
          onClick={logout}
          className="text-sm text-red-500 cursor-pointer hover:underline"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
