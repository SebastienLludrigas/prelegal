"use client";

import { useState, type ReactNode } from "react";
import { LoginScreen } from "@/components/LoginScreen";

export function AppGate({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <LoginScreen onSuccess={() => setLoggedIn(true)} />;
  }

  return <>{children}</>;
}
