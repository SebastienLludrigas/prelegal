"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LoginScreen } from "@/components/LoginScreen";
import type { SessionUser } from "@/lib/auth/types";
import type { GenericDocumentSource } from "@/lib/documents/catalogSource";

export function AppGate({
  ndaStandardTermsSource,
  ndaCoverPageIntro,
  ndaCoverPageFooter,
  genericDocuments,
}: {
  ndaStandardTermsSource: string;
  ndaCoverPageIntro: string;
  ndaCoverPageFooter: string;
  genericDocuments: Record<string, GenericDocumentSource>;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then(setUser)
      .finally(() => setCheckingSession(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  if (checkingSession) {
    return null;
  }

  if (!user) {
    return <LoginScreen onSuccess={setUser} />;
  }

  return (
    <AppShell
      user={user}
      onLogout={logout}
      ndaStandardTermsSource={ndaStandardTermsSource}
      ndaCoverPageIntro={ndaCoverPageIntro}
      ndaCoverPageFooter={ndaCoverPageFooter}
      genericDocuments={genericDocuments}
    />
  );
}
