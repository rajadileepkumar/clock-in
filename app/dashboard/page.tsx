"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/selectors/userSelector";
import { fetchUserSessions, type TimeSession } from "../store/slices/timeTrackingSlice";
import TimeTrackerCard from "../components/TimeTrackerCard";
import AttendanceCalendar from "../components/AttendanceCalendar";
import TimeSessionsTable from "../components/TimeSessionsTable";
import ClockInOutModal from "../components/ClockInOutModal";
import AttendanceRequestModal from "../components/AttendanceRequestModal";
import ClockOutPastModal from "../components/ClockOutPastModal";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const sessions = useAppSelector((state) => state.timeTracking.sessions) || [];
  
  const [showClockModal, setShowClockModal] = useState(false);
  const [clockAction, setClockAction] = useState<"IN" | "OUT">("IN");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showClockOutPastModal, setShowClockOutPastModal] = useState(false);
  const [preSelectedDate, setPreSelectedDate] = useState<string>("");

  // Find active session from any date (not just today)
  const activeSessionFromPast: TimeSession | undefined = sessions.find(
    (session: TimeSession) => session?.userId === user?.id && session?.status === "ACTIVE"
  );

  // Fetch sessions on page load
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserSessions());
    }
  }, [user?.id, dispatch]);

  // Refetch sessions when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user?.id) {
        dispatch(fetchUserSessions());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user?.id, dispatch]);

  const handleClockIn = () => {
    setClockAction("IN");
    setShowClockModal(true);
  };

  const handleClockOut = () => {
    setClockAction("OUT");
    setShowClockModal(true);
  };

  const handleClockOutPastDate = () => {
    setShowClockOutPastModal(true);
  };

  const handleRequestAttendance = () => {
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setPreSelectedDate("");
  };

  return (
    <div className="h-full space-y-6">
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TimeTrackerCard
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
          onClockOutPastDate={handleClockOutPastDate}
          activeSession={activeSessionFromPast}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section - Left */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Attendance Calendar
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Click on any date to view details. Green = Present, Amber = Pending
              </p>
            </div>
            <button
              onClick={() => handleRequestAttendance()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap"
              title="Request attendance for past dates"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Request Attendance
            </button>
          </div>

          {/* Calendar Component */}
          <div className="border border-gray-200 rounded-lg p-4">
            <AttendanceCalendar
              showTodayButton={true}
            />
          </div>
        </div>

        {/* Info Panel - Right */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3 hidden">
              <button
                onClick={handleClockIn}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium cursor-pointer transition-colors"
              >
                Clock In
              </button>
              <button
                onClick={handleClockOut}
                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium cursor-pointer transition-colors"
              >
                Clock Out
              </button>
              <button
                onClick={handleRequestAttendance}
                className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium cursor-pointer transition-colors"
              >
                Request Attendance
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Calendar Info:</strong> View your attendance status throughout the month. Green indicates Present, Amber indicates Pending requests.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Sessions
        </h2>
        <TimeSessionsTable limit={5} />
      </div>

      {/* Modals */}
      <ClockInOutModal
        isOpen={showClockModal}
        onClose={() => setShowClockModal(false)}
        action={clockAction}
      />

      <AttendanceRequestModal
        isOpen={showRequestModal}
        onClose={handleCloseRequestModal}
        preSelectedDate={preSelectedDate}
      />

      <ClockOutPastModal
        isOpen={showClockOutPastModal}
        onClose={() => setShowClockOutPastModal(false)}
        activeSession={activeSessionFromPast}
      />
    </div>
  );
}
