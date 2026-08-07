import { AlertCircle, X } from "lucide-react";

export const ErrorBanner = ({ error }: { error: string }) => (
  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm">
    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium">Errore di connessione:</span>
      <span className="text-sm">{error}</span>
    </div>
  </div>
);

export const LimitBanner = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className="mb-4">
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="flex-shrink-0">
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
      </div>
      <div className="flex-1 text-xs sm:text-sm">
        <h4 className="font-semibold text-red-900 dark:text-red-200">
          Limite Giornaliero Raggiunto
        </h4>
        <p className="text-red-700 dark:text-red-300">
          Hai esaurito le 5 domande giornaliere.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);
