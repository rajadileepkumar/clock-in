/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon as FilterIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useAppSelector } from "../store/selectors/userSelector";
import Pagination from "../components/Pagination";

interface TimeSessionsTableProps {
  limit?: number;
}

type SortField = "date" | "clockIn" | "clockOut" | "duration";
type SortOrder = "asc" | "desc";

export default function TimeSessionsTable({ limit }: TimeSessionsTableProps) {
  const user = useAppSelector((state) => state.auth.user);
  const sessions = useAppSelector((state) => state.timeTracking.sessions);
  
  // Filter user's sessions
  const userSessions = sessions.filter(session => session.userId === user?.id);
  
  // State for table
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [itemsPerPage] = useState(limit || 10);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "all",
  });

  // Format functions
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Sort and filter sessions
  const processedSessions = [...userSessions]
    .filter(session => {
      if (filters.dateFrom && session.date < filters.dateFrom) return false;
      if (filters.dateTo && session.date > filters.dateTo) return false;
      if (filters.status !== "all" && session.status !== filters.status) return false;
      return true;
    })
    .sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "date":
          aValue = a.date;
          bValue = b.date;
          break;
        case "clockIn":
          aValue = new Date(a.clockIn).getTime();
          bValue = new Date(b.clockIn).getTime();
          break;
        case "clockOut":
          aValue = a.clockOut ? new Date(a.clockOut).getTime() : 0;
          bValue = b.clockOut ? new Date(b.clockOut).getTime() : 0;
          break;
        case "duration":
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
      }

      return sortOrder === "asc" 
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

  // Pagination
  const totalItems = processedSessions.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = limit ? limit : startIndex + itemsPerPage;
  const paginatedSessions = processedSessions.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const columns = [
    { key: "date" as SortField, label: "Date", width: "w-32" },
    { key: "clockIn" as SortField, label: "Clock In", width: "w-32" },
    { key: "clockOut" as SortField, label: "Clock Out", width: "w-32" },
    { key: "duration" as SortField, label: "Duration", width: "w-32" },
    { key: "task" as any, label: "Task/Project", width: "flex-1" },
    { key: "status" as any, label: "Status", width: "w-24" },
  ];

  return (
    <div>
      {/* Filters Bar */}
      {!limit && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                {/* <option value="PAUSED">Paused</option> */}
              </select>
            </div>
            <div className="flex items-end">
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 cursor-pointer">
                <FilterIcon className="h-4 w-4 inline mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.width}`}
                >
                  {["date", "clockIn", "clockOut", "duration"].includes(col.key) ? (
                    <button
                      onClick={() => handleSort(col.key as SortField)}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      {col.label}
                      {sortBy === col.key && (
                        sortOrder === "asc" ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(session.date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(session.clockIn)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {session.clockOut ? formatTime(session.clockOut) : "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.duration && session.duration >= 8 * 60 * 60 * 1000
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {session.duration ? formatDuration(session.duration) : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {session.task || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.status === "ACTIVE"
                      ? "bg-blue-100 text-blue-800"
                      : session.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {session.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (only if not limited) */}
      {!limit && totalItems > itemsPerPage && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Empty State */}
      {userSessions.length === 0 && (
        <div className="text-center py-12">
          <DocumentArrowDownIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No time tracking records
          </h3>
          <p className="text-gray-500">
            Clock in to start tracking your time
          </p>
        </div>
      )}
    </div>
  );
}