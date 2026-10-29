import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React component tree:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h1 className="text-xl font-bold mb-2">មានបញ្ហាក្នុងការដំណើរការ (Application Error)</h1>
            <p className="text-sm text-neutral-400 mb-6">
              កម្មវិធីបានជួបប្រទះបញ្ហាបន្តិចបន្តួច។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីដំណើរការឡើងវិញ។
            </p>

            {this.state.error && (
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 text-left mb-6 font-mono text-xs text-red-400 overflow-x-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                ដំណើរការឡើងវិញ (Reload Studio)
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl transition"
              >
                សម្អាត Cache និងដំណើរការឡើងវិញ (Clear Cache & Reset)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
