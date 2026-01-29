// page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon as DeleteIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

import { User } from "../../../types/userType";
import Modal from "../../../components/Model";
import Toast, { ToastType } from "../../../components/Toast";
import UserForm from "../../../components/UserForm";
import Tooltip from "../../../components/Tooltip";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Pagination from "../../../components/Pagination";
import {
  fetchUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../../../store/slices/usersSlice";
import {
  useAppDispatch,
  useAppSelector,
  selectFilteredUsers,
  selectUsersLoading,
} from "../../../store/selectors/userSelector";

type ActionType = "delete" | "toggle";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectUsersLoading);

  // State for filters and pagination
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [mode, setMode] = useState<"create" | "update">("create");
  const [action, setAction] = useState<ActionType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 20;

  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
    visible: boolean;
  }>({
    type: "success",
    message: "",
    visible: false,
  });

  // Get filtered users
  const filteredUsers = useAppSelector((state) =>
    selectFilteredUsers(state, filters),
  );

  // Calculate paginated users
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalItems = filteredUsers.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const showToast = (
    type: ToastType,
    message: string,
    onClose?: () => void,
  ) => {
    setToast({ type, message, visible: true });
    window.setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
      if (onClose) onClose();
    }, 3000);
  };

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [filters.search, filters.role, filters.status]);

  // Handle sort
  const handleSort = (column: string) => {
    if (filters.sortBy === column) {
      setFilters({
        ...filters,
        sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
      });
    } else {
      setFilters({
        ...filters,
        sortBy: column,
        sortOrder: "asc",
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      role: "all",
      status: "all",
      sortBy: "",
      sortOrder: "asc",
    });
    setCurrentPage(1);
  };

  // Handle user creation
  const handleCreateUser = async (payload: {
    full_name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const role = payload.role as "ADMIN" | "USER";
      await dispatch(createUser({ ...payload, role })).unwrap();
      setShowCreate(false);
      showToast("success", "User created successfully");
      dispatch(fetchUsers()); // Refresh data
    } catch (err) {
      console.error(err);
      showToast("error", err instanceof Error ? err.message : "Create failed");
    }
  };

  // Handle user update
  const handleUpdateUser = async (payload: {
    full_name: string;
    email: string;
    role: string;
  }) => {
    if (!userData) return;
    try {
      const role = payload.role as "ADMIN" | "USER";
      await dispatch(
        updateUser({
          id: userData.id,
          full_name: payload.full_name,
          email: payload.email,
          role,
        }),
      ).unwrap();
      setShowCreate(false);
      setUserData(null);
      showToast("success", `User Updated successfully ${userData.full_name}`);
      dispatch(fetchUsers()); // Refresh data
    } catch (err) {
      console.error(err);
      showToast("error", err instanceof Error ? err.message : "Update failed");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id: string | number) => {
    try {
      await dispatch(deleteUser(Number(id))).unwrap();
      showToast("success", `User deleted successfully`);
      dispatch(fetchUsers()); // Refresh data
    } catch (err) {
      console.error(err);
      showToast("error", err instanceof Error ? err.message : "Delete failed");
    }
  };

  // Handle toggle user status
  const handleToggleUserStatus = async (
    id: string | number,
    status: string | null | undefined,
  ) => {
    try {
      if (!status || (status !== "Y" && status !== "N")) return;
      const nextStatus = status === "Y" ? "N" : "Y";
      await dispatch(
        toggleUserStatus({ id: Number(id), status: nextStatus }),
      ).unwrap();
      showToast("success", `User status updated successfully`);
      dispatch(fetchUsers()); // Refresh data
    } catch (err) {
      console.error(err);
      showToast("error", err instanceof Error ? err.message : "Toggle failed");
    }
  };

  if (loading && !paginatedUsers.length)
    return <p className="p-6 text-sm text-gray-500">Loading users...</p>;

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all users in the system
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className={`pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64 ${
                filters.search
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-300"
              }`}
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: "" })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <XMarkIcon className="h-4 w-4 text-yellow-500 hover:text-yellow-700" />
              </button>
            )}
          </div>

          {/* Filter toggle */}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer ${
              showFilters
                ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                : filters.role !== "all" ||
                    filters.status !== "all" ||
                    filters.search
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>

            {/* Show filter count badge when filters are active */}
            {(filters.role !== "all" ||
              filters.status !== "all" ||
              filters.search) && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 text-xs font-medium rounded-full bg-yellow-500 text-white">
                {[
                  filters.role !== "all" ? 1 : 0,
                  filters.status !== "all" ? 1 : 0,
                  filters.search ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          {/* Add user button */}
          <button
            onClick={() => {
              setMode("create");
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 cursor-pointer"
            aria-label="Add user"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filters panel */}

      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-700">Filter Users</h3>
              {/* Show active filter indicators */}
              {(filters.role !== "all" ||
                filters.status !== "all" ||
                filters.search) && (
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  <span className="text-xs text-yellow-600">
                    Filters Active
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(filters.role !== "all" ||
                filters.status !== "all" ||
                filters.search) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Clear all filters
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Role filter with active indicator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
              </div>
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-right-[16px] ${
                  filters.role !== "all"
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-300"
                }`}
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
            </div>

            {/* Status filter with active indicator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
              </div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  filters.status !== "all"
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-300"
                }`}
              >
                <option value="all">All Status</option>
                <option value="Y">Active</option>
                <option value="N">Inactive</option>
              </select>
            </div>

            {/* Results count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Found {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""}
                {(filters.role !== "all" ||
                  filters.status !== "all" ||
                  filters.search) && (
                  <span className="text-yellow-600 ml-2">
                    (Filtered from {totalItems} total)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active filters chips */}
          {(filters.role !== "all" ||
            filters.status !== "all" ||
            filters.search) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    Search: {filters.search}
                    <button
                      onClick={() => setFilters({ ...filters, search: "" })}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.role !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    Role: {filters.role}
                    <button
                      onClick={() => setFilters({ ...filters, role: "all" })}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.status !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    Status: {filters.status === "Y" ? "Active" : "Inactive"}
                    <button
                      onClick={() => setFilters({ ...filters, status: "all" })}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            {filters.search ||
            filters.role !== "all" ||
            filters.status !== "all"
              ? "Try adjusting your filters"
              : "No users in the system yet"}
          </p>
          {(filters.search ||
            filters.role !== "all" ||
            filters.status !== "all") && (
            <button
              onClick={clearFilters}
              className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: "id", label: "ID" },
                      { key: "full_name", label: "Name" },
                      { key: "email", label: "Email" },
                      { key: "role", label: "Role" },
                      { key: "status", label: "Status" },
                      { key: "actions", label: "Actions" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col.key === "actions" ? (
                          col.label
                        ) : (
                          <button
                            onClick={() =>
                              col.key !== "actions" && handleSort(col.key)
                            }
                            className="flex items-center gap-1 hover:text-gray-700"
                          >
                            {col.label}
                            {filters.sortBy === col.key && (
                              <>
                                {filters.sortOrder === "asc" ? (
                                  <ArrowUpIcon className="h-3 w-3" />
                                ) : (
                                  <ArrowDownIcon className="h-3 w-3" />
                                )}
                              </>
                            )}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedUsers.map((user: User, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === "Y"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status === "Y" ? (
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircleIcon className="h-3 w-3 mr-1" />
                          )}
                          {user.status === "Y" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                        <Tooltip content="Edit User" position="bottom">
                          <button
                            onClick={() => {
                              setShowCreate(true);
                              setMode("update");
                              setUserData(user);
                            }}
                            disabled={user.status === "N"}
                            className={`p-1 rounded cursor-pointer ${
                              user.status === "Y"
                                ? "text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>

                        <Tooltip
                          content={
                            user.status === "Y" ? "Deactivate" : "Activate"
                          }
                          position="bottom"
                        >
                          <button
                            onClick={() => {
                              setUserData(user);
                              setAction("toggle");
                            }}
                            className={`p-1 rounded cursor-pointer ${
                              user.status === "Y"
                                ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                                : "text-red-600 hover:text-red-900 hover:bg-red-50"
                            }`}
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Delete User" position="bottom">
                          <button
                            onClick={() => {
                              setUserData(user);
                              setAction("delete");
                            }}
                            className="p-1 rounded text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer"
                          >
                            <DeleteIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              className="border-t border-gray-200"
            />
          </div>
        </>
      )}

      {/* Modals and Dialogs */}
      <Modal
        isOpen={showCreate}
        title={mode === "create" ? "Create User" : "Update User"}
        onClose={() => {
          setShowCreate(false);
          setUserData(null);
          setMode("create");
        }}
      >
        {mode === "create" ? (
          <UserForm
            mode="create"
            onCancel={() => setShowCreate(false)}
            onSubmit={handleCreateUser}
          />
        ) : (
          <UserForm
            mode="update"
            initialData={
              userData
                ? {
                    full_name: userData.full_name,
                    email: userData.email,
                    role: userData.role,
                  }
                : null
            }
            onCancel={() => setShowCreate(false)}
            onSubmit={handleUpdateUser}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!userData && !!action}
        title={
          action === "delete"
            ? "Delete User"
            : userData?.status === "Y"
              ? "Deactivate User"
              : "Activate User"
        }
        description={
          action === "delete"
            ? "Are you sure you want to permanently delete this user? This action cannot be undone."
            : userData?.status === "Y"
              ? "This user will no longer be able to access the system."
              : "This user will be reactivated and regain access."
        }
        confirmText={
          action === "delete"
            ? "Delete"
            : userData?.status === "Y"
              ? "Deactivate"
              : "Activate"
        }
        danger={action === "delete"}
        onCancel={() => {
          setUserData(null);
          setAction(null);
        }}
        onConfirm={async () => {
          if (!userData) return;
          if (action === "delete") {
            await handleDeleteUser(userData.id);
          } else if (action === "toggle") {
            await handleToggleUserStatus(userData.id, userData.status);
          }
          setUserData(null);
          setAction(null);
        }}
      />

      <Toast
        type={toast.type}
        message={toast.message}
        visible={toast.visible}
      />
    </div>
  );
}
