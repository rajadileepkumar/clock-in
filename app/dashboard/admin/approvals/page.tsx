"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/selectors/userSelector";
import { TimeSession } from "../../../store/slices/timeTrackingSlice";
import { fetchUserSessions, 
 
  // updateSessionStatus 

} from "../../../store/slices/timeTrackingSlice";
import { CheckIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function ApprovalsPage() {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector((state) => state.timeTracking.sessions);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<TimeSession | null>(null);
  const [notes, setNotes] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filter pending sessions
  const pendingSessions = sessions.filter(session => session.status === "PENDING");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      // Fetch all sessions from your API
      await dispatch(fetchUserSessions()).unwrap(); // Assuming userId is 1 for now
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (sessionId: string) => {
    try {
      setActionInProgress(sessionId);
      // await dispatch(updateSessionStatus({
      //   sessionId,
      //   status: "APPROVED",
      //   notes
      // })).unwrap();
      
      setSelectedSession(null);
      setNotes("");
      alert("Session approved successfully!");
    } catch (error) {
      console.error("Failed to approve session:", error);
      alert("Failed to approve session");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (sessionId: string) => {
    if (!notes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setActionInProgress(sessionId);
      // await dispatch(updateSessionStatus({
      //   sessionId,
      //   status: "REJECTED",
      //   notes
      // })).unwrap();
      
      setSelectedSession(null);
      setNotes("");
      alert("Session rejected successfully!");
    } catch (error) {
      console.error("Failed to reject session:", error);
      alert("Failed to reject session");
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Approvals</h1>
        <p className="text-gray-600 mt-2">
          Review and approve pending attendance requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-800">{pendingSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <CheckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-gray-800">
                {sessions.filter(s => s.status === 'APPROVED' && 
                  new Date(s.clockIn).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <XMarkIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected Today</p>
              <p className="text-2xl font-bold text-gray-800">
                {sessions.filter(s => s.status === 'REJECTED' && 
                  new Date(s.clockIn).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Sessions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
          <p className="text-sm text-gray-600 mt-1">
            {pendingSessions.length} requests waiting for approval
          </p>
        </div>

        {pendingSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No pending requests</p>
            <p className="text-gray-400 text-sm mt-2">All attendance requests are up to date</p>
          </div>
        ) : (
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
                    Clock In / Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {session.userId}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            User ID: {session.userId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(session.clockIn).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.clockOut ? 
                          new Date(session.clockOut).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Not clocked out'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {session.duration ? formatDuration(session.duration) : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {session.notes || 'No notes'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSession(session);
                            setNotes(session.notes || '');
                          }}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Review Attendance Request
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{selectedSession.userId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">
                    {new Date(selectedSession.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Clock In</p>
                    <p className="font-medium">
                      {new Date(selectedSession.clockIn).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Clock Out</p>
                    <p className="font-medium">
                      {selectedSession.clockOut ? 
                        new Date(selectedSession.clockOut).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Not clocked out'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">
                    {selectedSession.duration ? formatDuration(selectedSession.duration) : 'Active'}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes for approval/rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedSession(null);
                    setNotes("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedSession.id)}
                  disabled={actionInProgress === selectedSession.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer disabled:opacity-50"
                >
                  {actionInProgress === selectedSession.id ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApprove(selectedSession.id)}
                  disabled={actionInProgress === selectedSession.id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer disabled:opacity-50"
                >
                  {actionInProgress === selectedSession.id ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}