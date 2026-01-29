"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../selectors/userSelector";
import { selectUser } from "../selectors/userSelector";

export function useAuthGuard(redirectTo = "/") {
  const user = useAppSelector(selectUser);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace(redirectTo);
    }
  }, [user, router, redirectTo]);

  return { user, isAuthenticated: !!user };
}
