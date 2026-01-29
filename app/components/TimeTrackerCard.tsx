/* eslint-disable react-hooks/purity */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PlayIcon,
  StopIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  //   PauseIcon,
} from "@heroicons/react/24/outline";
import { useAppSelector } from "../store/selectors/userSelector";

export default function TimeTrackerCard({
  onClockIn,
  onClockOut,
}: {
  onClockIn: () => void;
  onClockOut: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = useAppSelector((state) => state.auth.user);
  const sessions = useAppSelector((state) => state.timeTracking.sessions);

  // Find active session
  const activeSession = sessions.find(
    (session) => session.userId === user?.id && session.status === "ACTIVE",
  );

  // Calculate today's total
  const todaySessions = sessions.filter(
    (session) =>
      session.userId === user?.id &&
      session.date === new Date().toISOString().split("T")[0] &&
      session.status === "COMPLETED",
  );

  const totalToday = todaySessions.reduce(
    (sum, session) => sum + (session.duration || 0),
    0,
  );

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const hasActiveSessionFromYesterday = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Check if there are any sessions from yesterday without clockOut
    return sessions.some((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.getTime() === yesterday.getTime() && !session.clockOut;
    });
  }, [sessions]);

  return (
    <div className="bg-linear-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white mb-6">
      {hasActiveSessionFromYesterday && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">
              You forgot to clock out yesterday! Please clock in for today.
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Current Time & Status */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ClockIcon className="h-6 w-6" />
            <div>
              <p className="text-sm opacity-90">Current Time</p>
              <p className="text-2xl font-mono font-bold">
                {formatTime(currentTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <div
              className={`h-3 w-3 rounded-full ${activeSession ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}
            />
            <span className="text-sm">
              {activeSession ? "Currently Clocked In" : "Not Clocked In"}
            </span>
          </div>
        </div>

        {/* Center: Today's Total */}
        <div className="text-center">
          <p className="text-sm opacity-90 mb-1">Total Hours Today</p>
          <p className="text-4xl font-bold">{formatDuration(totalToday)}</p>
          <p className="text-sm opacity-80 mt-1">
            {todaySessions.length} session
            {todaySessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex gap-3">
          {activeSession ? (
            <>
              <button
                onClick={onClockOut}
                className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors shadow-md cursor-pointer"
              >
                <StopIcon className="h-5 w-5" />
                Clock Out
              </button>
              {/*
              
              <button
                className="flex items-center gap-2 px-4 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors"
              >
                <PauseIcon className="h-5 w-5" />
                Pause
              </button>
                */}
            </>
          ) : (
            <button
              onClick={onClockIn}
              className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md cursor-pointer"
            >
              <PlayIcon className="h-5 w-5" />
              Clock In
            </button>
          )}
        </div>
      </div>

      {/* Active Session Timer */}
      {activeSession && (
        <div className="mt-6 pt-6 border-t border-blue-500/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Current Session</p>
              <p className="text-lg font-semibold">
                Started at{" "}
                {new Date(activeSession.clockIn).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Elapsed Time</p>
              <p className="text-2xl font-mono font-bold">
                {formatDuration(
                  Date.now() - new Date(activeSession.clockIn).getTime(),
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
