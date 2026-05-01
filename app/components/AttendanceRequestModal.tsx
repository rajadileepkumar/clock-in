"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  useAppDispatch,
  useAppSelector,
} from "../store/selectors/userSelector";
import { clockIn } from "../store/slices/timeTrackingSlice";
import { buildISODateTime } from "../utils/datehelper";
import Toast from "./Toast";

type AttendanceRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  preSelectedDate?: string;
};

export default function AttendanceRequestModal({
  isOpen,
  onClose,
  preSelectedDate,
}: AttendanceRequestModalProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(preSelectedDate || today);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [useDateRange, setUseDateRange] = useState<boolean>(false);
  const [clockInTime, setClockInTime] = useState<string>("09:00");
  const [clockOutTime, setClockOutTime] = useState<string>("17:00");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Calculate 9 hours duration in milliseconds
  const NINE_HOURS_MS = 9 * 60 * 60 * 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!user?.id) {
      setError("User not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      setIsLoading(true);

      // If using date range, submit for each date in the range
      if (useDateRange && dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const dates: string[] = [];

        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
          // Skip weekends (Saturday = 6, Sunday = 0)
          if (d.getDay() !== 0 && d.getDay() !== 6) {
            dates.push(d.toISOString().split("T")[0]);
          }
        }

        // Submit all dates
        for (const date of dates) {
          const payload = {
            userId: user.id,
            status: "PENDING",
            clockIn: buildISODateTime(date, parseFloat(clockInTime)),
            clockOut: buildISODateTime(date, parseFloat(clockOutTime)),
            date: date,
            duration: NINE_HOURS_MS,
          };

          await dispatch(clockIn(payload)).unwrap();
        }

        setToastMessage(`✓ Submitted attendance for ${dates.length} day(s)`);
        setShowToast(true);
      } else {
        // Single date submission
        const payload = {
          userId: user.id,
          status: "PENDING",
          clockIn: buildISODateTime(selectedDate, parseFloat(clockInTime)),
          clockOut: buildISODateTime(selectedDate, parseFloat(clockOutTime)),
          date: selectedDate,
          duration: NINE_HOURS_MS,
        };

        await dispatch(clockIn(payload)).unwrap();
        setToastMessage("✓ Attendance request submitted successfully!");
        setShowToast(true);
      }

      // Reset form and close after short delay
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Request submission failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit request. Please try again.",
      );
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(today);
    setDateFrom("");
    setDateTo("");
    setUseDateRange(false);
    setClockInTime("09:00");
    setClockOutTime("17:00");
    setReason("");
    setError(null);
    setSuccessMessage(null);
  };

  if (!isOpen) return null;

  const isPastDate = (date: string) => {
    return date < today;
  };

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
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Date Selection Mode Toggle */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Date Option
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!useDateRange}
                    onChange={() => setUseDateRange(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Single Date</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={useDateRange}
                    onChange={() => setUseDateRange(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Date Range</span>
                </label>
              </div>
            </div>

            {/* Single Date Selection */}
            {!useDateRange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required={!useDateRange}
                  max={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select the date you missed attendance (past dates only)
                </p>
              </div>
            )}

            {/* Date Range Selection */}
            {useDateRange && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required={useDateRange}
                    max={today}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Start date</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required={useDateRange}
                    max={today}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">End date (excludes weekends)</p>
                </div>
              </div>
            )}

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clock In Time <span className="text-red-500">*</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clock Out Time <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Missing <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain why you missed attendance (e.g., forgot to clock in/out, system issue, medical emergency, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your request will be reviewed by an administrator. They may approve, reject, or request additional information. You&apos;ll receive a notification once a decision is made.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting || isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        type="success"
        message={toastMessage}
        visible={showToast}
        position="left-bottom"
      />
    </>
  );
}
