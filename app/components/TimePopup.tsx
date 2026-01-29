"use client";

import { XMarkIcon, ClockIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isClockedIn: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  confirmationState: {
    show: boolean;
    type: "clock-in" | "clock-out";
    time: string;
    date: string;
    duration?: string;
    totalDayHours?: string;
  };
  onCloseConfirmation: () => void;
  totalDayHours: string;
};

export default function TimePopup({
  isOpen,
  onClose,
  isClockedIn,
  onClockIn,
  onClockOut,
  confirmationState,
  onCloseConfirmation,
  totalDayHours,
}: Props) {
  if (!isOpen) return null;

  // Show confirmation screen if action was just performed
  if (confirmationState.show) {
    return (
      <div className="
        fixed inset-0 z-[100]
        flex items-start justify-center
        pt-20
        bg-black/20 backdrop-blur-sm
      ">
        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 animate-fadeIn relative">
          {/* Close Icon */}
          <button
            onClick={() => {
              onCloseConfirmation();
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                confirmationState.type === "clock-in"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {confirmationState.type === "clock-in" ? (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {confirmationState.type === "clock-in" ? "Clocked In" : "Clocked Out"}
            </h3>

            <div className="space-y-1 mb-4">
              <p className="text-3xl font-bold text-gray-900">{confirmationState.time}</p>
              <p className="text-sm text-gray-500">{confirmationState.date}</p>
              
              {/* Show duration if clocking out */}
              {confirmationState.type === "clock-out" && confirmationState.duration && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Session Duration</p>
                  <p className="text-2xl font-bold text-blue-600">{confirmationState.duration}</p>
                </div>
              )}
              
              {/* Show total day hours */}
              {confirmationState.totalDayHours && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Total Today</p>
                  <p className="text-lg font-semibold text-gray-700">{confirmationState.totalDayHours}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onCloseConfirmation();
                onClose();
              }}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show main popup with Clock-In/Clock-Out buttons
  return (
    <div className="
      fixed inset-0 z-[100]
      flex items-start justify-center
      pt-20
      bg-black/20 backdrop-blur-sm
    ">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 animate-fadeIn relative">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
            <ClockIcon className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Time Tracking
          </h3>

          <p className="text-sm text-gray-500 mb-2">
            {isClockedIn ? "You are currently clocked in" : "You are currently clocked out"}
          </p>

          {/* Show total day hours */}
          <div className="mb-6">
            <p className="text-xs text-gray-500">Total Hours Today</p>
            <p className="text-2xl font-bold text-blue-600">{totalDayHours}</p>
          </div>

          {/* Buttons side by side */}
          <div className="flex gap-3">
            {/* Cancel button - always first */}
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>

            {/* Clock-In or Clock-Out button - second */}
            {!isClockedIn ? (
              <button
                onClick={onClockIn}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium cursor-pointer"
              >
                <ClockIcon className="w-5 h-5" />
                Clock In
              </button>
            ) : (
              <button
                onClick={onClockOut}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Clock Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}