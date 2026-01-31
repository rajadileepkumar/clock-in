/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types for time records (for simple clock in/out history)
export type TimeRecord = {
  id: string;
  userId: number;
  type: "clock-in" | "clock-out";
  timestamp: string;
  date: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: string;
};

// Types for time sessions (for detailed tracking)
export type TimeSession = {
  id: string;
  userId: number;
  date: string;
  clockIn: string;
  clockOut: string | null;
  duration: number | null;
  status:
    | "ACTIVE"
    | "COMPLETED"
    | "PAUSED"
    | "PENDING"
    | "REJECTED"
    | "APPROVED";
  task?: string;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
};

type TimeTrackingState = {
  sessions: TimeSession[];
  records: TimeRecord[]; // Added this for Header component
  loading: boolean;
  error: string | null;
  activeSession: TimeSession | null;
  isClockedIn: boolean; // Quick check flag
  historySessions: TimeSession[];
  historyLoading: boolean;
  historyPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  historyFilters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  };
};

const initialState: TimeTrackingState = {
  sessions: [],
  records: [], // Added empty array
  loading: false,
  error: null,
  activeSession: null,
  isClockedIn: false,
  historySessions: [],
  historyLoading: false,
  historyPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  historyFilters: {
    status: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  },
};

// ============ ASYNC THUNKS ============

// In timeTrackingSlice.ts
export const clockIn = createAsyncThunk(
  "timeTracking/clockIn",
  async (payload: {
    userId: number; // Add userId here
    status?: string;
    clockInTime?: string;
    clockOutTime?: string;
    date?: string;
  }) => {
    const res = await fetch("/api/time-tracking/clock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Clock in failed");
    }
    return await res.json();
  },
);

// Clock Out
// In timeTrackingSlice.ts
export const clockOut = createAsyncThunk(
  "timeTracking/clockOut",
  async (payload: {
    userId: number; // Add userId here too
    notes?: string;
    location?: any;
  }) => {
    const res = await fetch("/api/time-tracking/clock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Clock out failed");
    }
    return await res.json();
  },
);

// Fetch user sessions
export const fetchUserSessions = createAsyncThunk(
  "timeTracking/fetchUserSessions",

  async () => {
    const res = await fetch(`/api/time-tracking/user`);
    if (!res.ok) throw new Error("Failed to fetch sessions");
    return await res.json();
  },
);

// Add these to your slice
export const fetchUserHistoryRequests = createAsyncThunk(
  "timeTracking/fetchUserHistoryRequests",
  async ({
    userId,
    page = 1,
    limit = 10,
  }: {
    userId: string | number;
    page?: number;
    limit?: number;
  }) => {
    const res = await fetch(
      `/api/time-tracking/history?userId=${userId}&page=${page}&limit=${limit}`,
    );
    if (!res.ok) throw new Error("Failed to fetch history");
    return await res.json();
  },
);

// Add these thunks
// export const fetchPendingSessions = createAsyncThunk(
//   'timeTracking/fetchPendingSessions',
//   async () => {
//     const response = await fetch('/api/sessions/pending');
//     return await response.json();
//   }
// );

// export const updateSessionStatus = createAsyncThunk(
//   'timeTracking/updateSessionStatus',
//   async ({ sessionId, status, notes }: {
//     sessionId: string,
//     status: 'APPROVED' | 'REJECTED',
//     notes: string
//   }) => {
//     const response = await fetch(`/api/sessions/${sessionId}/status`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ status, notes })
//     });
//     return await response.json();
//   }
// );

// ============ SLICE ============

const timeTrackingSlice = createSlice({
  name: "timeTracking",
  initialState,
  reducers: {
    clearActiveSession: (state) => {
      state.activeSession = null;
      state.isClockedIn = false;
    },

    // ADDED: For Header component to use
    addTimeRecord: (state, action: PayloadAction<TimeRecord>) => {
      state.records.push(action.payload);

      // Update isClockedIn flag based on last record
      if (state.records.length > 0) {
        const lastRecord = state.records[state.records.length - 1];
        state.isClockedIn = lastRecord.type === "clock-in";
      }
    },

    // ADDED: Clear all records (optional)
    clearTimeRecords: (state) => {
      state.records = [];
      state.isClockedIn = false;
    },

    // ADDED: Manually set clocked in status
    setClockedIn: (state, action: PayloadAction<boolean>) => {
      state.isClockedIn = action.payload;
    },

    // ADDED: Add a session (for testing or manual entry)
    addSession: (state, action: PayloadAction<TimeSession>) => {
      state.sessions.push(action.payload);
      if (action.payload.status === "ACTIVE") {
        state.activeSession = action.payload;
        state.isClockedIn = true;
      }
    },
  },
  extraReducers: (builder) => {
    // Clock In
    builder
      .addCase(clockIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
        state.activeSession = action.payload;
        state.isClockedIn = true;
        state.loading = false;
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Clock in failed";
      });

    // Clock Out
    builder.addCase(clockOut.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clockOut.fulfilled, (state, action) => {
      const index = state.sessions.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
      state.activeSession = null;
      state.isClockedIn = false;
      state.loading = false;

      // Also add to records for Header component
      state.records.push({
        id: `record_${Date.now()}`,
        userId: action.payload.userId,
        type: "clock-out",
        timestamp: action.payload.clockOut || new Date().toISOString(),
        date: action.payload.date,
        location: action.payload.location,
        createdAt: new Date().toISOString(),
      });
    });
    builder.addCase(clockOut.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Clock out failed";
    });

    // Fetch Sessions
    builder.addCase(fetchUserSessions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserSessions.fulfilled, (state, action) => {
      state.sessions = action.payload;
      state.activeSession =
        action.payload.find((s: TimeSession) => s.status === "ACTIVE") || null;
      state.isClockedIn = !!state.activeSession;
      state.loading = false;

      // Build records from sessions for Header component
      state.records = action.payload.reduce(
        (acc: TimeRecord[], session: TimeSession) => {
          // Add clock-in record
          acc.push({
            id: `record_${session.id}_in`,
            userId: session.userId,
            type: "clock-in",
            timestamp: session.clockIn,
            date: session.date,
            location: session.location,
            createdAt: session.createdAt,
          });

          // Add clock-out record if exists
          if (session.clockOut) {
            acc.push({
              id: `record_${session.id}_out`,
              userId: session.userId,
              type: "clock-out",
              timestamp: session.clockOut,
              date: session.date,
              location: session.location,
              createdAt: session.updatedAt,
            });
          }

          return acc;
        },
        [],
      );
    });
    builder.addCase(fetchUserSessions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch sessions";
    });
    builder
      .addCase(fetchUserHistoryRequests.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchUserHistoryRequests.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historySessions = action.payload.data || action.payload;
        state.historyPagination = action.payload.pagination || {
          page: 1,
          limit: 10,
          total: action.payload.total || 0,
          totalPages: Math.ceil((action.payload.total || 0) / 10),
        };
      })
      .addCase(fetchUserHistoryRequests.rejected, (state) => {
        state.historyLoading = false;
      })
  },
});

// Export all actions
export const {
  clearActiveSession,
  addTimeRecord,
  clearTimeRecords,
  setClockedIn,
  addSession,
} = timeTrackingSlice.actions;

export default timeTrackingSlice.reducer;
