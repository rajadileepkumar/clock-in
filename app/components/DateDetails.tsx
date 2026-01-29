"use client";

import { useMemo } from "react";
import { useAppSelector } from "../store/selectors/userSelector";
import { TimeSession } from "../store/slices/timeTrackingSlice";

type DateDetailsProps = {
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

export default function DateDetails({ selectedDate }: DateDetailsProps) {
  const user = useAppSelector((state) => state.auth.user);
  const sessions = useAppSelector((state) => state.timeTracking.sessions);

  const daySessions = useMemo(() => {
    if (!selectedDate || !user?.id) return [];

    const dateKey = selectedDate.toISOString().split("T")[0];
    return sessions
      .filter(
        (session) =>
          session.userId === user.id &&
          session.date === dateKey &&
          session.duration
      )
      .sort(
        (a, b) =>
          new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime()
      );
  }, [selectedDate, user?.id, sessions]);

  const totalHours = useMemo(() => {
    return daySessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0
    );
  }, [daySessions]);

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Select a date to view details</p>
      </div>
    );
  }

  const dateStr = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{dateStr}</h3>

      {daySessions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No attendance records for this date</p>
      ) : (
        <>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Hours</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatDuration(totalHours)}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Sessions ({daySessions.length})
            </h4>
            {daySessions.map((session, index) => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    Session {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatDuration(session.duration || 0)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Clock In</p>
                    <p className="font-medium text-gray-800">
                      {formatTime(session.clockIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Clock Out</p>
                    <p className="font-medium text-gray-800">
                      {session.clockOut ? formatTime(session.clockOut) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}