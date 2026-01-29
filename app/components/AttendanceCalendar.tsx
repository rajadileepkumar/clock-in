"use client";

import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAppSelector } from "../store/selectors/userSelector";
import { TimeSession } from "../store/slices/timeTrackingSlice";

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type AttendanceCalendarProps = {
  onDateClick?: (date: Date) => void;
  selectedDate?: Date | null;
  showTodayButton?: boolean;
};

export default function AttendanceCalendar({
  onDateClick,
  selectedDate,
  showTodayButton = true,
}: AttendanceCalendarProps) {
  const user = useAppSelector((state) => state.auth.user);
  const sessions = useAppSelector((state) => state.timeTracking.sessions);
  const [currentDate, setCurrentDate] = useState<Date | null>(
    selectedDate || new Date(),
  );

  // const activeMonth = currentDate?.getMonth();
  // const activeYear = currentDate?.getFullYear();
  // const today = new Date();
  // console.log("Today's date:", today);

  const attendanceData = useMemo(() => {
    if (!user?.id)
      return new Map<string, { totalHours: number; sessions: TimeSession[] }>();

    const data = new Map<
      string,
      { totalHours: number; sessions: TimeSession[] }
    >();

    sessions
      .filter((session) => session.userId === user.id && session.duration)
      .forEach((session) => {
        const dateKey = session.date;
        const existing = data.get(dateKey) || { totalHours: 0, sessions: [] };

        existing.totalHours += session.duration || 0;
        existing.sessions.push(session);

        data.set(dateKey, existing);
      });

    return data;
  }, [user, sessions]);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateKey = toLocalDateKey(date);
    const attendance = attendanceData.get(dateKey);

    // Check for pending request
    const hasPendingRequest = pendingRequests.some(
      (req) => req.date === dateKey && req.status === "pending",
    );

    return (
      <div className="mt-auto pt-2 w-full">
        {hasPendingRequest && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
        )}

        {attendance && attendance.sessions.length > 0 && (
          <>
            <div className="text-xs font-semibold text-white">
              {Math.floor(attendance.totalHours / (1000 * 60 * 60)) > 0
                ? `${Math.floor(attendance.totalHours / (1000 * 60 * 60))}h`
                : ""}
              {Math.floor(
                (attendance.totalHours % (1000 * 60 * 60)) / (1000 * 60),
              ) > 0
                ? ` ${Math.floor((attendance.totalHours % (1000 * 60 * 60)) / (1000 * 60))}m`
                : ""}
            </div>
            <div className="text-[10px] text-white font-medium">
              {attendance.sessions.length}{" "}
              {attendance.sessions.length === 1 ? "session" : "sessions"}
            </div>
          </>
        )}

        {/* Add a small indicator for past dates without attendance */}
        {isPastDate(date) &&
          !attendance?.sessions.length &&
          !hasPendingRequest && (
            <div className="text-[10px] text-gray-400">No records</div>
          )}
      </div>
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";

    const dateKey = toLocalDateKey(date);
    const attendance = attendanceData.get(dateKey);
    const isTodayDate = isToday(date);
    const isSelected = selectedDate && dateKey === toLocalDateKey(selectedDate);
    const isPast = isPastDate(date);

    // Check if it's Saturday (6) or Sunday (0)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Check for pending request
    const hasPendingRequest = pendingRequests.some(
      (req) => req.date === dateKey && req.status === "pending",
    );

    let classes =
      "flex flex-col items-center justify-start transition-colors min-h-[80px]";

    // Add cursor pointer only for past dates and today
    if (isPast || isTodayDate) {
      classes += " cursor-pointer hover:bg-gray-100";
    } else {
      classes += " cursor-not-allowed opacity-50";
    }

    // Weekend styling - red text for Sat/Sun
    if (isWeekend) {
      classes += " weekend-day";
    }

    if (isSelected) {
      classes += " bg-blue-200 font-bold";
    } else if (isTodayDate && !isSelected) {
      classes += " bg-blue-50";
    }

    if (attendance && attendance.sessions.length > 0) {
      classes += " border-2 border-green-500";
    }

    if (hasPendingRequest) {
      classes += " relative border-2 border-amber-500";
    }

    return classes;
  };

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setCurrentDate(value);
      onDateClick?.(value);
    } else if (Array.isArray(value) && value[0]) {
      setCurrentDate(value[0]);
      onDateClick?.(value[0]);
    }
  };

  // Add this state for pending requests (you'll need to fetch from your backend)
  const [pendingRequests, setPendingRequests] = useState<
    Array<{ date: string; status: string }>
  >([
    // Example data - replace with actual API call
    { date: "2026-01-28", status: "pending" },
    { date: "2026-01-27", status: "pending" },
  ]);

  const activeMonth = currentDate?.getMonth();
  const activeYear = currentDate?.getFullYear();
  const today = new Date();

  // Add this function to check if date is in the past
  const isPastDate = (date: Date) => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const dateMidnight = new Date(date);
    dateMidnight.setHours(0, 0, 0, 0);
    return dateMidnight < todayMidnight;
  };

  // Add this function to check if date is today
  const isToday = (date: Date) => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const dateMidnight = new Date(date);
    dateMidnight.setHours(0, 0, 0, 0);
    return dateMidnight.getTime() === todayMidnight.getTime();
  };

  return (
    <div className="w-full h-full min-h-0">
      {showTodayButton && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              onDateClick?.(today);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium cursor-pointer"
          >
            Go to Today
          </button>
        </div>
      )}

      <Calendar
        value={currentDate}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) setCurrentDate(activeStartDate);
        }}
        className="attendance-calendar"
        next2Label={null}
        prev2Label={null}
        tileContent={tileContent}
        tileClassName={tileClassName}
        onClickDay={(value: Date) => {
          // Only allow clicks on past dates and today
          if (isPastDate(value) || isToday(value)) {
            setCurrentDate(value);
            onDateClick?.(value);
          }
        }}
        tileDisabled={({ date, view }) => {
          if (view !== "month") return false;
          // Disable future dates
          return !isPastDate(date) && !isToday(date);
        }}
      />
    </div>
  );
}

// Add this to your global CSS or as a style tag:
<style jsx global>{`
  .weekend-day .react-calendar__tile abbr {
    color: #dc2626 !important; /* red-600 */
  }

  .react-calendar__tile--now {
    background-color: #eff6ff !important; /* blue-50 */
  }

  .react-calendar__tile--active {
    background-color: #bfdbfe !important; /* blue-200 */
  }
`}</style>;
