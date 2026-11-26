import React from 'react';

// (2026-07-13) React ErrorBoundary for all Securo portals; was none
export default class ReactErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected application error.' };
  }

  componentDidCatch(error, info) {
    console.error('[Securo React ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Outfit', system-ui, sans-serif",
          background: '#f8fafc',
          color: '#0f172a'
        }}>
          <div style={{
            maxWidth: '420px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Something went wrong</h2>
            <p style={{ margin: '0 0 18px', fontSize: '0.9rem', color: '#64748b' }}>
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontWeight: 700,
                background: '#5a1fe0',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Reload Securo
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
