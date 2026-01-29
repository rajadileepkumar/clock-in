// store/selectors/userSelector.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../index";

/* =======================
   Selectors with safe defaults
======================= */

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.user);
export const getTheRole = (state: RootState) => state.auth.user?.role || "USER";

// User-related selectors with safe access
export const selectUsersState = (state: RootState) => state.users || {
  list: [],
  loading: false,
  error: null,
};

export const selectAllUsers = (state: RootState) => 
  selectUsersState(state).list;

export const selectUsersLoading = (state: RootState) => 
  selectUsersState(state).loading;

export const selectUsersError = (state: RootState) => 
  selectUsersState(state).error;

/* =======================
   Typed hooks
======================= */

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* =======================
   Filter & Sort Selectors
======================= */
export const selectFilteredUsers = (
  state: RootState,
  filters: {
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
) => {
  const usersState = selectUsersState(state);
  let users = [...usersState.list];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    users = users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
    );
  }

  // Apply role filter
  if (filters.role && filters.role !== "all") {
    users = users.filter((user) => user.role === filters.role);
  }

  // Apply status filter
  if (filters.status && filters.status !== "all") {
    users = users.filter((user) => user.status === filters.status);
  }

  // Apply sorting
  if (filters.sortBy) {
    users.sort((a, b) => {
      let aValue = a[filters.sortBy as keyof typeof a];
      let bValue = b[filters.sortBy as keyof typeof b];

      // Handle undefined/null values
      if (aValue === undefined || aValue === null) aValue = "";
      if (bValue === undefined || bValue === null) bValue = "";

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return filters.sortOrder === "desc"
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      // Handle number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return filters.sortOrder === "desc" ? bValue - aValue : aValue - bValue;
      }

      return 0;
    });
  }

  return users;
};