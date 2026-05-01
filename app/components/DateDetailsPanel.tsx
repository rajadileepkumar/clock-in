"use client";

import { useMemo, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAppSelector } from "../store/selectors/userSelector";
import { TimeSession } from "../store/slices/timeTrackingSlice";
import {toLocalDateKey} from "../utils/datehelper";

type DateDetailsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
};

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};

export default function DateDetailsPanel({
  isOpen,
  onClose,
  selectedDate,
}: DateDetailsPanelProps) {
  const user = useAppSelector((state) => state.auth.user);
   const sessionsState = useAppSelector((state) => state.timeTracking);
  const sessions = Array.isArray(sessionsState?.sessions) ? sessionsState.sessions : [];

  const daySessions = useMemo(() => {
    if (!selectedDate || !user?.id) return [];

    const dateKey = toLocalDateKey(selectedDate);
    return sessions
      .filter(
        (session) =>
          session.userId === user.id &&
          session.date === dateKey &&
          session.duration,
      )
      .sort(
        (a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime(),
      );
  }, [selectedDate, user, sessions]); // Changed from [selectedDate, user?.id, sessions]

  const totalHours = useMemo(() => {
    return daySessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0,
    );
  }, [daySessions]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!selectedDate) return null;

  const dateStr = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Attendance Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {dateStr}
              </h3>
            </div>

            {daySessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                </div>
                <p className="text-gray-500 text-lg">No attendance records</p>
                <p className="text-gray-400 text-sm mt-2">
                  No attendance records for this date
                </p>
              </div>
            ) : (
              <>
                {/* Total Hours Card */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatDuration(totalHours)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {daySessions.length}{" "}
                    {daySessions.length === 1 ? "session" : "sessions"}
                  </p>
                </div>

                {/* Sessions List */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    Sessions
                  </h4>
                  <div className="space-y-3">
                    {daySessions.map((session, index) => (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              Session {index + 1}
                            </span>
                          </div>
                          <span className="text-base font-semibold text-green-600">
                            {formatDuration(session.duration || 0)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 rounded-md">
                            <p className="text-xs text-gray-500 mb-1">
                              Clock In
                            </p>
                            <p className="font-semibold text-gray-800">
                              {formatTime(session.clockIn)}
                            </p>
                          </div>
                          <div className="p-3 bg-red-50 rounded-md">
                            <p className="text-xs text-gray-500 mb-1">
                              Clock Out
                            </p>
                            <p className="font-semibold text-gray-800">
                              {session.clockOut
                                ? formatTime(session.clockOut)
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
