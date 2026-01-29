export type TimeStatus = "ACTIVE" | "COMPLETED" | "PENDING" | "PAUSED";
type TimeSession = {
  id: string;                    // Unique session ID
  userId: number;               // User ID
  date: string;                 // "YYYY-MM-DD"
  clockIn: string;              // ISO timestamp
  clockOut: string | null;      // ISO timestamp (null if active)
  duration: number | null;      // milliseconds (null if active)
  status: TimeStatus;
  projectId?: string;           // Optional project
  task?: string;                // Optional task description
  notes?: string;               // Optional notes
  breakDuration?: number;       // Break time in ms
  location?: {                 // Optional geolocation
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
};

export type { TimeSession };