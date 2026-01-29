import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User, Role } from "../../types/userType"; // Import Role type

type UsersState = {
  list: User[];
  loading: boolean;
  error: string | null;
};

const initialState: UsersState = {
  list: [],
  loading: false,
  error: null,
};

// 🔹 Fetch users
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return (await res.json()) as User[];
});


// // In usersSlice.ts
// type UsersState = {
//   list: User[];
//   loading: boolean;
//   error: string | null;
//   pagination: {
//     currentPage: number;
//     totalPages: number;
//     totalItems: number;
//     itemsPerPage: number;
//   };
// };

// // Update fetchUsers to accept pagination params
// export const fetchUsers = createAsyncThunk(
//   "users/fetchUsers",
//   async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) => {
//     const res = await fetch(`/api/users?page=${page}&limit=${limit}`);
//     if (!res.ok) throw new Error("Failed to fetch users");
//     const data = await res.json();
//     return data; // Should include { users: User[], pagination: {...} }
//   }
// );

// 🔹 Create user
export const createUser = createAsyncThunk(
  "users/createUser",
  async (payload: {
    full_name: string;
    email: string;
    password: string;
    role: Role; // Change from string to Role
  }) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Create failed");
    return (await res.json()) as User;
  },
);

// 🔹 Update user
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (payload: {
    id: number;
    full_name: string;
    email: string;
    role: Role; // Change from string to Role
  }) => {
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Update failed");
    return payload;
  },
);

// 🔹 Toggle status
export const toggleUserStatus = createAsyncThunk(
  "users/toggleStatus",
  async ({ id, status }: { id: number; status: "Y" | "N" }) => {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) throw new Error("Toggle failed");
    return { id, status };
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: number) => {
    const res = await fetch(`/api/users?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
    return id; // Return the deleted user ID
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })

      // create
      .addCase(createUser.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // update
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = {
            ...state.list[idx],
            ...action.payload,
          };
        }
      })

      // toggle
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const user = state.list.find((u) => u.id === action.payload.id);
        if (user) user.status = action.payload.status;
      })

      // delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        // Remove the deleted user from the list
        state.list = state.list.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.error.message ?? null;
      });
  },
});

export default usersSlice.reducer;
