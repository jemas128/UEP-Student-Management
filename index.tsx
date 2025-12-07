import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Simple Error Boundary to catch crashes
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#800000', maxWidth: '600px', margin: '0 auto', marginTop: '50px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #800000', paddingBottom: '0.5rem'}}>System Error</h1>
          <p style={{marginBottom: '1rem'}}>Something went wrong while loading the application.</p>
          <div style={{ background: '#f8f8f8', padding: '1rem', borderRadius: '4px', overflow: 'auto', fontSize: '0.85rem', fontFamily: 'monospace', color: '#333' }}>
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#800000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Data & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);