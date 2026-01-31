/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  useAppDispatch,
  useAppSelector,
  selectUser,
  selectFilteredHistory,
  selectHistoryPagination,
  selectHistoryLoading,
  selectHistoryFilters,
} from "../../store/selectors/userSelector";
import { fetchUserHistoryRequests } from "../../store/slices/timeTrackingSlice";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../../components/Pagination";
import Tooltip from "../../components/Tooltip";
import Model from "../../components/Model";
import { formatTime, formatDate } from "../../utils/datehelper";

interface Session {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: string;
  task?: string;
  project?: string;
  notes?: string;
  location?: {
    address?: string;
  };
}

interface LocalFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const historySessions = useAppSelector(selectFilteredHistory);
  const pagination = useAppSelector(selectHistoryPagination);
  const isLoading = useAppSelector(selectHistoryLoading);
  const filters = useAppSelector(selectHistoryFilters);

  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [localFilters, setLocalFilters] = useState(() => ({
    status: filters.status ?? "",
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
    search: filters.search ?? "",
  }));

  const userFullName = user?.full_name;

  const filteredSessions = useMemo(() => {
    let filtered = [...historySessions];

    // Apply status filter
    if (localFilters.status) {
      filtered = filtered.filter(
        (session) => session.status === localFilters.status,
      );
    }

    // Apply date range filter
    if (localFilters.dateFrom && !localFilters.dateTo) {
      // Only dateFrom is provided - get exact date match
      filtered = filtered.filter(
        (session) => session.date === localFilters.dateFrom,
      );
    } else if (!localFilters.dateFrom && localFilters.dateTo) {
      // Only dateTo is provided - get exact date match
      filtered = filtered.filter(
        (session) => session.date === localFilters.dateTo,
      );
    } else if (localFilters.dateFrom && localFilters.dateTo) {
      // Both dates are provided - get records between these dates
      filtered = filtered.filter(
        (session) =>
          session.date >= localFilters.dateFrom &&
          session.date <= localFilters.dateTo,
      );
    }

    // Apply search filter
    if (localFilters.search) {
      const searchTerm = localFilters.search.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          (session.task && session.task.toLowerCase().includes(searchTerm)) ||
          (userFullName && userFullName.toLowerCase().includes(searchTerm)),
      );
    }

    return filtered;
  }, [historySessions, localFilters, userFullName]); // Use the extracted value

  // Fetch data when page changes
  useEffect(() => {
    if (!user?.id) return;

    dispatch(
      fetchUserHistoryRequests({
        userId: user.id,
        page: pagination.page,
        limit: pagination.limit,
      }),
    );
  }, [user?.id, dispatch, pagination.page, pagination.limit]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (user?.id) {
        dispatch(
          fetchUserHistoryRequests({
            userId: user?.id,
            page,
            limit: pagination.limit,
          }),
        );
      }
    },
    [user?.id, dispatch, pagination.limit],
  );

  const handleFilterChange = useCallback(
    (key: keyof LocalFilters, value: string) => {
      setLocalFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  // const handleSearch = () => {
  //   applyFilters();
  // };

  const clearFilters = useCallback(() => {
    setLocalFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <ClockIcon className="w-5 h-5 text-amber-500" />;
      case "ACTIVE":
        return <ExclamationCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Time Tracking History
          </h1>
          <p className="text-gray-600 mt-2">
            View your complete attendance and time tracking history
          </p>
        </div>

        {/* Stats Cards - Updated to use filteredSessions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredSessions.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    filteredSessions.filter(
                      (s: any) => s.status === "COMPLETED",
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {
                    filteredSessions.filter((s: any) => s.status === "PENDING")
                      .length
                  }
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-800">
                  {
                    filteredSessions.filter((s: any) => s.status === "ACTIVE")
                      .length
                  }
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Input */}
              <form className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={localFilters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {localFilters.search && (
                    <button
                      type="button"
                      onClick={() => handleFilterChange("search", "")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </form>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <FunnelIcon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Filters</span>
                {(localFilters.status ||
                  localFilters.dateFrom ||
                  localFilters.dateTo) && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={localFilters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                      <option value="ACTIVE">Active</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={localFilters.dateFrom}
                        onChange={(e) =>
                          handleFilterChange("dateFrom", e.target.value)
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={localFilters.dateTo}
                        onChange={(e) =>
                          handleFilterChange("dateTo", e.target.value)
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex items-end gap-2">
                    <button
                      onClick={clearFilters}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Your Time Sessions
              </h2>
              <span className="text-sm text-gray-600">
                Showing {filteredSessions.length} of {pagination.total} records
              </span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <DocumentTextIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No history records found</p>
              <p className="text-gray-400 text-sm mt-2">
                {Object.values(localFilters).some(Boolean)
                  ? "Try adjusting your filters"
                  : "Your time tracking history will appear here"}
              </p>
            </div>
          ) : (
            <>
              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      filteredSessions.map((session: any) => (
                        <tr
                          key={session.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {user?.full_name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase() || "UU"}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user?.full_name || "Unknown User"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">
                                {session.date}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatTime(session.clockIn)}
                              {session.clockOut && (
                                <span className="text-gray-500 ml-1">
                                  → {formatTime(session.clockOut)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(session.status)}
                              <span className="text-sm font-medium capitalize">
                                {session.status.toLowerCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <Tooltip content="View Details">
                                <button
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setShowDetails(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                >
                                  View
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="border-t border-gray-200">
                  <Pagination
                    currentPage={pagination.page}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                    className="px-6 py-4"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && showDetails && (
        <Model
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedSession(null);
          }}
          title="Session Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold">
                  {formatDate(selectedSession.date)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedSession.status)}
                  <span className="font-semibold capitalize">
                    {selectedSession.status.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Clock In</p>
                <p className="font-semibold">
                  {formatTime(selectedSession.clockIn)}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Clock Out</p>
                <p className="font-semibold">
                  {selectedSession.clockOut
                    ? formatTime(selectedSession.clockOut)
                    : "Not clocked out"}
                </p>
              </div>
            </div>

            {selectedSession.task && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Task / Project</p>
                <p className="font-semibold">{selectedSession.task}</p>
                {selectedSession.project && (
                  <p className="text-sm text-purple-600 mt-1">
                    {selectedSession.project}
                  </p>
                )}
              </div>
            )}

            {selectedSession.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-gray-700">{selectedSession.notes}</p>
              </div>
            )}

            {selectedSession.location && (
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-sm text-gray-700">
                  {selectedSession.location.address || "No address available"}
                </p>
              </div>
            )}
          </div>
        </Model>
      )}
    </div>
  );
}
