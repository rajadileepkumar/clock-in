"use client";

import { useState, useMemo } from "react";
import TimeTrackerCard from "../components/TimeTrackerCard";
import AttendanceCalendar from "../components/AttendanceCalendar";
import TimeSessionsTable from "../components/TimeSessionsTable";
import ClockInOutModal from "../components/ClockInOutModal";
import DateDetailsPanel from "../components/DateDetailsPanel";
import AttendanceRequestModal from "../components/AttendanceRequestModal";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [clockAction, setClockAction] = useState<"IN" | "OUT">("IN");
  const [showRequestModal, setShowRequestModal] = useState(false); // New state

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const handleDateClick = (date: Date) => {
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    // Only allow clicks on today or past dates
    if (clickedDate <= today) {
      setSelectedDate(date);
      setIsPanelOpen(true);
    }
  };

  const handleClockIn = () => {
    setClockAction("IN");
    setShowClockModal(true);
  };

  const handleClockOut = () => {
    setClockAction("OUT");
    setShowClockModal(true);
  };

  const handleRequestAttendance = () => {
    setShowRequestModal(true);
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Attendance Calendar</h1>
          <p className="text-gray-600">
            Click on any date to view detailed attendance information
          </p>
        </div>
        <button
          onClick={handleRequestAttendance}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium cursor-pointer transition-colors flex items-center gap-2"
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

      {/* Time Tracker Card (Clock In/Out + Today's total) */}
      <TimeTrackerCard onClockIn={handleClockIn} onClockOut={handleClockOut} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4">
            <AttendanceCalendar
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </div>
        </div>

        {/* Recent Sessions (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {`Today's Sessions`}
            </h3>
            <TimeSessionsTable limit={5} />
          </div>
        </div>
      </div>

      {/* All Sessions Table (Full width) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Time Tracking History
          </h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer">
              This Week
            </button>
            <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
              Export CSV
            </button>
          </div>
        </div>
        <TimeSessionsTable />
      </div>

      {/* Modals & Panels */}
      <ClockInOutModal
        isOpen={showClockModal}
        onClose={() => setShowClockModal(false)}
        action={clockAction}
      />

      <DateDetailsPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        selectedDate={selectedDate}
      />
      {/* Attendance Request Modal */}
      <AttendanceRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
}
