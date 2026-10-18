import React from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      
      // Try to parse JSON error from handleFirestoreError
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = parsed.error;
          }
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
          <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-bold text-fg tracking-tight">Something went wrong</h2>
              <p className="text-sm text-muted leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={this.handleReset}
                className="btn-vibrant w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-accent/20"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>
            
            <p className="text-[10px] text-muted/50 uppercase tracking-widest">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
