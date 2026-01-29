"use client";

import { useState } from "react";

type UserFormProps =
  | {
      mode: "create";
      onCancel: () => void;
      onSubmit: (payload: CreateUserPayload) => void;
      initialData?: CreateUserPayload | null;
    }
  | {
      mode: "update";
      onCancel: () => void;
      onSubmit: (payload: UpdateUserPayload) => void;
      initialData: UpdateUserPayload | null;
    };

type CreateUserPayload = {
  full_name: string;
  email: string;
  password: string;
  role: string;
};

type UpdateUserPayload = {
  full_name: string;
  email: string;
  role: string;
};

export default function UserForm({
  mode,
  initialData,
  onCancel,
  onSubmit,
}: UserFormProps) {
  const [full_name, setFullName] = useState(initialData?.full_name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialData?.role ?? "");

  const isEmailValid = (v: string) => /^\S+@\S+\.\S+$/.test(v);
  const isPasswordValid = (p: string) => p.length >= 8;

  const allFilled =
    full_name.trim() !== "" && email.trim() !== "" && role.trim() !== "";

  const canSubmit =
    mode === "create"
      ? allFilled && isEmailValid(email) && isPasswordValid(password)
      : allFilled && isEmailValid(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (mode === "create") {
      const payload: CreateUserPayload = {
        full_name,
        email,
        role,
        password,
      };

      onSubmit(payload);
    } else {
      const payload: UpdateUserPayload = {
        full_name,
        email,
        role,
      };

      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-md border p-2"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border p-2"
        />
      </div>

      {/* Password only for CREATE */}
      {mode === "create" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border p-2"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>
      )}

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded-md border p-2"
        >
          <option value="">Select role</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 border rounded-md cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`px-4 py-2 rounded-md cursor-pointer ${
            canSubmit
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {mode === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
}
