import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LegalModal } from "./LegalModal";
import { useAuthLogin } from "@/hooks/useAuthLogin";

export function Auth() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<"terms" | "privacy" | "cookie">("terms");
  const { loading, error, startGoogleLogin } = useAuthLogin();

  const openLegal = (type: "terms" | "privacy" | "cookie") => {
    setLegalDocType(type);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors duration-500">
      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
        <div className="text-center animate-fade-in-down">
          <div className="w-20 h-20 bg-linear-to-br from-[#003366] to-[#004080] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Uni Search
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Il tuo assistente universitario intelligente
          </p>
        </div>

        <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 shadow-2xl relative overflow-hidden group mt-8">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#003366]/5 dark:bg-[#003366]/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />

          <CardHeader className="space-y-1 relative z-10">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Accedi
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Usa il tuo account Google per accedere
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <Button
              onClick={startGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 transition-all shadow-sm hover:shadow-md mt-2 py-6"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continua con Google
            </Button>
            {error && (
              <p className="mt-3 text-center text-sm text-red-500">
                {error}
              </p>
            )}
          </CardContent>

          <CardFooter className="justify-center relative z-10 pb-6" />
        </Card>

        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <button onClick={() => openLegal("terms")} className="hover:text-[#003366] dark:hover:text-blue-400 transition-colors">
              Termini
            </button>
            <button onClick={() => openLegal("privacy")} className="hover:text-[#003366] dark:hover:text-blue-400 transition-colors">
              Privacy
            </button>
            <button onClick={() => openLegal("cookie")} className="hover:text-[#003366] dark:hover:text-blue-400 transition-colors">
              Cookie
            </button>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-600 text-center">
            &copy; {new Date().getFullYear()} Uni Search. All rights reserved.
          </div>
        </div>
      </div>

      <LegalModal isOpen={legalModalOpen} onClose={() => setLegalModalOpen(false)} documentType={legalDocType} />
    </div>
  );
}
