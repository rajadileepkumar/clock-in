"use client";

import { ReactNode } from "react";
import { useAuthGuard } from "../store/hooks/useAuthGuard";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthGuard();

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
