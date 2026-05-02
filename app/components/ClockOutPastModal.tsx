"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../store/selectors/userSelector";
import { clockOut, fetchUserSessions, type TimeSession } from "../store/slices/timeTrackingSlice";
import Toast from "./Toast";

type ClockOutPastModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activeSession?: TimeSession;
};

export default function ClockOutPastModal({
  isOpen,
  onClose,
  activeSession,
}: ClockOutPastModalProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [clockOutTime, setClockOutTime] = useState<string>("17:00");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        // Fetch fresh sessions after toast closes
        dispatch(fetchUserSessions());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError("Please provide a message explaining why you forgot to clock out");
      return;
    }

    if (!activeSession) {
      setError("No active session found");
      return;
    }

    try {
      setIsSubmitting(true);

      // Build clock out time
      const [hours, minutes] = clockOutTime.split(":");
      const clockOutDate = new Date(activeSession.date);
      clockOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (!user?.id) {
        setError("User not found");
        return;
      }

      const payload = {
        userId: user.id,
        notes: message,
      };

      await dispatch(clockOut(payload)).unwrap();
      
      // Immediately fetch fresh sessions after clock out
      await dispatch(fetchUserSessions()).unwrap();

      setToastMessage("✓ Clock out recorded successfully!");
      setShowToast(true);

      // Close modal immediately after success
      onClose();
      setMessage("");
      setClockOutTime("17:00");
    } catch (err) {
      console.error("Clock out failed:", err);
      setError(err instanceof Error ? err.message : "Failed to clock out. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !activeSession) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Clock Out for Past Date
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Forgot to clock out?</strong> You can update your clock out time here. Please provide details about why you forgot.
              </p>
            </div>

            {/* Active Session Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clock In Time
              </label>
              <input
                type="text"
                disabled
                value={new Date(activeSession.clockIn).toLocaleString()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>

            {/* Clock Out Time */}
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

            {/* Reason/Message - MANDATORY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why did you forget to clock out? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Please explain why you forgot to clock out (e.g., system crash, forgot to close, in a meeting, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This message is mandatory and will be attached to your session record.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Clock Out"
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
