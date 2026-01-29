"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  useAppDispatch,
  useAppSelector,
} from "../store/selectors/userSelector";
import { clockIn } from "../store/slices/timeTrackingSlice";
import { buildISODateTime } from "../utils/datehelper";

type AttendanceRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AttendanceRequestModal({
  isOpen,
  onClose,
}: AttendanceRequestModalProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user); // Get user from Redux

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [clockInTime, setClockInTime] = useState<string>("09:00");
  const [clockOutTime, setClockOutTime] = useState<string>("17:00");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Submit to backend
    console.log("Request submitted:", {
      date: selectedDate,
      clockIn: buildISODateTime(selectedDate, parseFloat(clockInTime)),
      clockOut: buildISODateTime(selectedDate, parseFloat(clockOutTime)),
      reason,
    });

    if (!user?.id) {
      setError("User not found. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        userId: user.id, // Add userId
        status: "PENDING",
        clockIn: buildISODateTime(selectedDate, parseFloat(clockInTime)),
        clockOut: buildISODateTime(selectedDate, parseFloat(clockOutTime)),
        date: selectedDate,
      };

      await dispatch(clockIn(payload)).unwrap();
      resetForm();
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error("Clock action failed:", err);
      setError(
        err instanceof Error ? err.message : "Action failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }

    // Simulate API call
    // setTimeout(() => {
    //   setIsSubmitting(false);
    //   alert("Attendance request submitted for admin approval!");
    //   onClose();
    //   resetForm();
    // }, 1000);
  };

  const resetForm = () => {
    setSelectedDate("");
    setClockInTime("09:00");
    setClockOutTime("17:00");
    setReason("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Request Missing Attendance
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date *
              </label>
              <input
                type="date"
                required
                max={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select the date you missed attendance
              </p>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clock In Time *
                </label>
                <input
                  type="time"
                  required
                  value={clockInTime}
                  onChange={(e) => setClockInTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clock Out Time *
                </label>
                <input
                  type="time"
                  required
                  value={clockOutTime}
                  onChange={(e) => setClockOutTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Missing *
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain why you missed attendance (e.g., forgot to clock in/out, system issue, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Supporting Documents (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supporting Documents (Optional)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Choose File
                </button>
                <span className="text-sm text-gray-500">No file chosen</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload any supporting documents (max 5MB)
              </p>
            </div>

            {/* Status Indicator */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-sm text-amber-800">
                  Request will be pending until admin approval
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || isLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
          {error && (
            <div className="mx-6 mt-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
