"use client";

import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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
  showTodayButton?: boolean;
};

export default function AttendanceCalendar({
  showTodayButton = true,
}: AttendanceCalendarProps) {
  const user = useAppSelector((state) => state.auth.user);
  const sessionsState = useAppSelector((state) => state.timeTracking);
  const sessions = useMemo(
    () => Array.isArray(sessionsState?.sessions) ? sessionsState.sessions : [],
    [sessionsState]
  );
  const [currentDate, setCurrentDate] = useState<Date | null>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const attendanceData = useMemo(() => {
    if (!user?.id)
      return new Map<string, { totalHours: number; sessions: TimeSession[]; status: string }>();

    const data = new Map<
      string,
      { totalHours: number; sessions: TimeSession[]; status: string }
    >();

    const userSessions = sessions.filter((session) => session.userId === user.id);
    console.log("User:", user?.id, "Total sessions:", sessions.length, "User sessions:", userSessions.length, "Sessions:", userSessions);

    userSessions.forEach((session) => {
      const dateKey = session.date;
      const existing = data.get(dateKey) || { totalHours: 0, sessions: [], status: "ABSENT" };

      existing.totalHours += session.duration || 0;
      existing.sessions.push(session);
      
      // Determine status based on sessions
      if (session.status === "COMPLETED" || session.status === "APPROVED") {
        existing.status = "PRESENT";
      } else if (session.status === "PENDING") {
        existing.status = "PENDING";
      }

      data.set(dateKey, existing);
    });

    console.log("Attendance data map:", data);
    return data;
  }, [user, sessions]);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateKey = toLocalDateKey(date);
    const attendance = attendanceData.get(dateKey);

    return (
      <div className="mt-auto pt-2 w-full flex flex-col items-center gap-1">
        {attendance ? (
          <>
            {/* Status Badge */}
            <div className="text-xs font-bold">
              {attendance.status === "PRESENT" && (
                <span className="px-2 py-1 bg-green-500 text-white rounded-full text-[10px]">
                  Present
                </span>
              )}
              {attendance.status === "PENDING" && (
                <span className="px-2 py-1 bg-amber-500 text-white rounded-full text-[10px]">
                  Pending
                </span>
              )}
            </div>

            {/* Hours */}
            {/* {attendance.totalHours > 0 && (
              <div className="text-xs font-semibold text-gray-700">
                {Math.floor(attendance.totalHours / (1000 * 60 * 60)) > 0
                  ? `${Math.floor(attendance.totalHours / (1000 * 60 * 60))}h`
                  : ""}
                {Math.floor(
                  (attendance.totalHours % (1000 * 60 * 60)) / (1000 * 60),
                ) > 0
                  ? ` ${Math.floor((attendance.totalHours % (1000 * 60 * 60)) / (1000 * 60))}m`
                  : ""}
              </div>
            )} */}

            {/* Session Count */}
              {/* <div className="text-[10px] text-gray-600">
                {attendance.sessions.length}{" "}
                {attendance.sessions.length === 1 ? "session" : "sessions"}
              </div> */}
          </>
        ) : (
          isPastDate(date) && !isToday(date) && (
            <div className="text-[10px] text-gray-400">No records</div>
          )
        )}
      </div>
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";

    const dateKey = toLocalDateKey(date);
    const attendance = attendanceData.get(dateKey);
    const isTodayDate = isToday(date);

    let classes =
      "flex flex-col items-center justify-start transition-colors min-h-[100px] p-1 bg-white";

    // Check attendance status FIRST (higher priority than "today")
    if (attendance) {
      if (attendance.status === "PRESENT") {
        classes += " border-2 border-green-500";
      } else if (attendance.status === "PENDING") {
        classes += " border-2 border-amber-500";
      } else {
        classes += " border border-gray-200";
      }
    } else if (isTodayDate) {
      // Only show blue border if it's today AND has no attendance data
      classes += " border-2 border-blue-500";
    } else {
      // No records
      classes += " border border-gray-200";
    }

    return classes;
  };

  const handlePrevMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    const newDate = new Date(newYear, newMonth, 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    const newDate = new Date(newYear, newMonth, 1);
    setCurrentDate(newDate);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    const newDate = new Date(newYear, selectedMonth, 1);
    setCurrentDate(newDate);
  };

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

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="w-full h-full min-h-0">
      {/* Navigation Controls */}
      <div className="mb-4 space-y-3">
        {showTodayButton && (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedYear(today.getFullYear());
                setSelectedMonth(today.getMonth());
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium cursor-pointer transition-colors"
            >
              Go to Today
            </button>
          </div>
        )}

        {/* Month and Year Controls */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
          {/* Previous Button */}
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          {/* Month/Year Display */}
          <div className="flex items-center gap-3">
            {/* Month */}
            <span className="text-lg font-semibold text-gray-700">
              {months[selectedMonth]}
            </span>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-semibold cursor-pointer hover:bg-gray-100"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full" />
            <span>No Records</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        value={currentDate}
        activeStartDate={currentDate || new Date()}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) {
            setCurrentDate(activeStartDate);
            setSelectedYear(activeStartDate.getFullYear());
            setSelectedMonth(activeStartDate.getMonth());
          }
        }}
        className="attendance-calendar"
        next2Label={null}
        prev2Label={null}
        nextLabel={null}
        prevLabel={null}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />

      <style jsx>{`
        .attendance-calendar .react-calendar__tile {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          min-height: 100px;
          padding: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        .attendance-calendar .react-calendar__tile:enabled {
          background-color: white !important;
        }

        .attendance-calendar .react-calendar__tile:enabled:hover {
          background-color: white !important;
        }

        .attendance-calendar .react-calendar__tile:enabled:focus {
          background-color: white !important;
        }

        .attendance-calendar .react-calendar__tile--active {
          background-color: white !important;
        }

        .attendance-calendar .react-calendar__tile--now {
          background-color: white !important;
          border: 2px solid #3b82f6 !important;
        }

        .attendance-calendar .react-calendar__month-view__weekdays {
          background-color: #f9fafb;
          padding: 8px 0;
        }

        .attendance-calendar .react-calendar__month-view__weekdays__weekday {
          font-weight: 600;
          color: #374151;
          padding: 8px 0;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
