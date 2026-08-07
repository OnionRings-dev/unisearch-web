import { useState } from "react";
import { RagInterface } from "@/components/rag/RagInterface";
import { Auth } from "@/components/Auth";
import { LandingPage } from "@/components/LandingPage";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/loader";

export default function App() {
  const {
    auth,
    initializing,
    callbackError,
    clearCallbackError,
    handleLogout,
  } = useAuth();
  const [page, setPage] = useState<"landing" | "auth">("landing");

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <Loader size="lg" variant="circular" />
      </div>
    );
  }

  if (callbackError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-red-500">{callbackError}</p>
          <button
            onClick={() => {
              clearCallbackError();
              window.location.href = "/";
            }}
            className="text-sm text-[#003366] hover:underline"
          >
            Torna al login
          </button>
        </div>
      </div>
    );
  }

  if (auth) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RagInterface
          userId={auth.userId}
          token={auth.token}
          userEmail={auth.email}
          onLogout={() => {
            handleLogout();
            setPage("landing");
          }}
        />
      </ThemeProvider>
    );
  }

  if (page === "landing") {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <LandingPage onNavigate={() => setPage("auth")} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Auth />
    </ThemeProvider>
  );
}
