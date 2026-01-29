"use client";

import React from "react";

export type ToastType = "success" | "error";

export default function Toast({
  type,
  message,
  visible,
}: {
  type: ToastType;
  message: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div
        className={`max-w-sm w-full rounded-md shadow-lg ring-1 ring-black/5 overflow-hidden ${type === "success" ? "bg-white" : "bg-white"}`}
      >
        <div
          className={`p-4 flex items-start gap-3 ${type === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}`}
        >
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${type === "success" ? "text-green-700" : "text-red-700"}`}
            >
              {type === "success" ? "Success" : "Error"}
            </p>
            <p className="mt-1 text-sm text-gray-700">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
