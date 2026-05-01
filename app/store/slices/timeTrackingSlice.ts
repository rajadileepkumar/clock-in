/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// ============ TYPES ============

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

// History filters type
export type HistoryFilters = {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

// Pagination type
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// History response type
export type HistoryResponse = {
  data: TimeSession[];
  pagination: Pagination;
};

// State type
type TimeTrackingState = {
  sessions: TimeSession[];
  records: TimeRecord[];
  loading: boolean;
  error: string | null;
  
  // Active session
  activeSession: TimeSession | null;
  isClockedIn: boolean;
  
  // History
  historySessions: any[]; // Use any[] to handle different response structures
  historyLoading: boolean;
  historyPagination: Pagination;
  historyFilters: HistoryFilters;
};

// ============ INITIAL STATE ============

const initialState: TimeTrackingState = {
  sessions: [],
  records: [],
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

// ============ HELPER FUNCTIONS ============

/**
 * Builds query parameters for history requests
 */
const buildHistoryQueryParams = (
  userId: string | number,
  page: number = 1,
  limit: number = 10,
  filters?: HistoryFilters
): string => {
  const params = new URLSearchParams({
    userId: userId.toString(),
    page: page.toString(),
    limit: limit.toString(),
  });

  // Add filters if provided
  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.search) params.append('search', filters.search);
  }

  return params.toString();
};

/**
 * Converts sessions to records for Header component
 */
const sessionsToRecords = (sessions: TimeSession[]): TimeRecord[] => {
  return sessions.reduce((acc: TimeRecord[], session: TimeSession) => {
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
  }, []);
};

// ============ ASYNC THUNKS ============

// Clock In
export const clockIn = createAsyncThunk(
  "timeTracking/clockIn",
  async (payload: {
    userId: number;
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
  }
);

// Clock Out
export const clockOut = createAsyncThunk(
  "timeTracking/clockOut",
  async (payload: {
    userId: number;
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
  }
);

// Fetch user sessions
export const fetchUserSessions = createAsyncThunk(
  "timeTracking/fetchUserSessions",
  async () => {
    const res = await fetch(`/api/time-tracking/user`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch sessions");
    }
    
    return await res.json();
  }
);

// Fetch user history with filters and pagination
export const fetchUserHistory = createAsyncThunk<
  HistoryResponse,
  {
    userId: string | number;
    page?: number;
    limit?: number;
    filters?: HistoryFilters;
  }
>(
  "timeTracking/fetchUserHistory",
  async ({ userId, page = 1, limit = 10, filters }) => {
    const queryParams = buildHistoryQueryParams(userId, page, limit, filters);
    const res = await fetch(`/api/time-tracking/history?${queryParams}`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch history");
    }
    
    return await res.json();
  }
);

// Update session status
export const updateSessionStatus = createAsyncThunk(
  "timeTracking/updateSessionStatus",
  async ({
    sessionId,
    status,
    userId,
  }: {
    sessionId: string;
    status: "COMPLETED" | "REJECTED";
    userId: string | number;
  }) => {
    const response = await fetch(`/api/time-tracking/sessions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, status, userId }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update session status");
    }
    
    return { id: sessionId, status };
  }
);

// ============ SLICE ============

const timeTrackingSlice = createSlice({
  name: "timeTracking",
  initialState,
  reducers: {
    // Session management
    clearActiveSession: (state) => {
      state.activeSession = null;
      state.isClockedIn = false;
    },

    addSession: (state, action: PayloadAction<TimeSession>) => {
      state.sessions.push(action.payload);
      if (action.payload.status === "ACTIVE") {
        state.activeSession = action.payload;
        state.isClockedIn = true;
      }
    },

    resetSessions: (state) => {
      state.sessions = [];
      state.activeSession = null;
      state.isClockedIn = false;
    },

    // Records management (for Header component)
    addTimeRecord: (state, action: PayloadAction<TimeRecord>) => {
      state.records.push(action.payload);

      // Update isClockedIn flag based on last record
      if (state.records.length > 0) {
        const lastRecord = state.records[state.records.length - 1];
        state.isClockedIn = lastRecord.type === "clock-in";
      }
    },

    clearTimeRecords: (state) => {
      state.records = [];
      state.isClockedIn = false;
    },

    // Clock status
    setClockedIn: (state, action: PayloadAction<boolean>) => {
      state.isClockedIn = action.payload;
    },

    // History filters
    setHistoryFilters: (state, action: PayloadAction<Partial<HistoryFilters>>) => {
      state.historyFilters = {
        ...state.historyFilters,
        ...action.payload,
      };
      // Reset to first page when filters change
      state.historyPagination.page = 1;
    },

    clearHistoryFilters: (state) => {
      state.historyFilters = {
        status: "",
        dateFrom: "",
        dateTo: "",
        search: "",
      };
      state.historyPagination.page = 1;
    },

    setHistoryPage: (state, action: PayloadAction<number>) => {
      state.historyPagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ============ CLOCK IN ============
    builder
      .addCase(clockIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        const session = action.payload;
        if (session && typeof session === 'object') {
          state.sessions.push(session);
          state.activeSession = session;
          state.isClockedIn = true;
        }
        state.loading = false;
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Clock in failed";
      });

    // ============ CLOCK OUT ============
    builder
      .addCase(clockOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        const updatedSession = action.payload;
        if (updatedSession && typeof updatedSession === 'object') {
          const index = state.sessions.findIndex((s) => s.id === updatedSession.id);
          if (index !== -1) {
            state.sessions[index] = updatedSession;
          }
          state.activeSession = null;
          state.isClockedIn = false;

          // Add clock-out record
          state.records.push({
            id: `record_${Date.now()}`,
            userId: updatedSession.userId,
            type: "clock-out",
            timestamp: updatedSession.clockOut || new Date().toISOString(),
            date: updatedSession.date,
            location: updatedSession.location,
            createdAt: new Date().toISOString(),
          });
        }
        state.loading = false;
      })
      .addCase(clockOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Clock out failed";
      });

    // ============ FETCH SESSIONS ============
    builder
      .addCase(fetchUserSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSessions.fulfilled, (state, action) => {
        // Ensure payload is an array
        const sessionsArray = Array.isArray(action.payload) ? action.payload : [];
        state.sessions = sessionsArray;
        
        // Find active session
        const active = sessionsArray.find((s: TimeSession) => s.status === "ACTIVE") || null;
        state.activeSession = active;
        state.isClockedIn = !!active;
        state.loading = false;

        // Convert sessions to records
        state.records = sessionsToRecords(sessionsArray);
      })
      .addCase(fetchUserSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch sessions";
      });

    // ============ FETCH HISTORY ============
    builder
      .addCase(fetchUserHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchUserHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        
        const data = action.payload as HistoryResponse;
        
        // Handle standard response structure
        state.historySessions = Array.isArray(data.data) ? data.data : [];
        state.historyPagination = data.pagination;
      })
      .addCase(fetchUserHistory.rejected, (state) => {
        state.historyLoading = false;
        // Optionally set an error state for history
        // state.historyError = action.error.message;
      });

    // ============ UPDATE SESSION STATUS ============
    builder.addCase(updateSessionStatus.fulfilled, (state, action) => {
      const { id, status } = action.payload;
      
      // Update in sessions array
      const index = state.sessions.findIndex((s) => s.id === id);
      if (index !== -1) {
        state.sessions[index].status = status;
      }
      
      // Update in historySessions if present
      const historyIndex = state.historySessions.findIndex((s) => s.id === id);
      if (historyIndex !== -1) {
        state.historySessions[historyIndex].status = status;
      }
      
      // If updating active session
      if (state.activeSession?.id === id) {
        state.activeSession.status = status;
      }
    });
  },
});

// Export all actions
export const {
  clearActiveSession,
  addTimeRecord,
  clearTimeRecords,
  setClockedIn,
  addSession,
  resetSessions,
  setHistoryFilters,
  clearHistoryFilters,
  setHistoryPage,
} = timeTrackingSlice.actions;

export default timeTrackingSlice.reducer;