"use client";

import { useState } from "react";
import { 
  XMarkIcon, 
  MapPinIcon, 
  DocumentTextIcon,
  ClockIcon 
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../store/selectors/userSelector"; // Import useAppSelector
import { clockIn, clockOut } from "../store/slices/timeTrackingSlice";

interface ClockInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "IN" | "OUT";
}

export default function ClockInOutModal({
  isOpen,
  onClose,
  action,
}: ClockInOutModalProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user); // Get user from Redux
  
  const [task, setTask] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user?.id) {
      setError("User not found. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const payload = {
        userId: user.id, // Add userId
      };

      console.log("Submitting clock action:", { action, payload });

      if (action === "IN") {
        await dispatch(clockIn(payload)).unwrap();
      } else {
        await dispatch(clockOut(payload)).unwrap();
      }

      onClose();
      // Reset form
      setTask("");
      setNotes("");
      setLocation(null);
    } catch (err) {
      console.error("Clock action failed:", err);
      setError(err instanceof Error ? err.message : "Action failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Your current location",
          });
        },
        () => {
          alert("Unable to retrieve location");
        }
      );
    }
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg cursor-pointer ${action === "IN" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                <ClockIcon className="h-6 w-6 cursor-pointer" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {action === "IN" ? "Clock In" : "Clock Out"}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-6 mt-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Current Time */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="text-center">
              <p className="text-sm text-gray-600">Current Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {/* Task/Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task / Project (Optional)
              </label>
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="What are you working on?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this session..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <button
                  type="button"
                  onClick={getLocation}
                  className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                  disabled={isLoading}
                >
                  <MapPinIcon className="h-4 w-4 inline mr-1" />
                  Use Current Location
                </button>
              </div>
              {location ? (
                <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm">
                  <MapPinIcon className="h-4 w-4 inline mr-2" />
                  {location.address}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 text-gray-500 rounded-lg text-sm">
                  Location not recorded
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg font-semibold text-white cursor-pointer ${action === "IN" 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
              } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  {action === "IN" ? "Clock In Now" : "Clock Out Now"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}