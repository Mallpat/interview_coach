import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled app error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/get-started';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#080C14',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            color: '#F87171',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            !
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Application Notice
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8', maxWidth: '320px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {this.state.error?.message || 'A transient error occurred. Tap below to resume your session.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '12px',
              background: '#00F5A0',
              border: 'none',
              color: '#080C14',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Return to Welcome Screen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
