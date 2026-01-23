import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Simple test component
function TestApp() {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#008080', marginBottom: '20px' }}>
        ✅ Wasel App Test - Component Rendering Successfully
      </h1>
      
      <div style={{
        background: '#f0f9ff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Diagnostic Information:</h2>
        <ul>
          <li>✅ React is working</li>
          <li>✅ HTML root element found</li>
          <li>✅ CSS is loading</li>
          <li>✅ JavaScript is executing</li>
        </ul>
      </div>

      <div style={{
        background: '#f0fdf4',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Environment Variables:</h2>
        <ul>
          <li>Mock Auth: {import.meta.env.VITE_ENABLE_MOCK_AUTH || 'not set'}</li>
          <li>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</li>
          <li>Mode: {import.meta.env.MODE}</li>
        </ul>
      </div>

      <button 
        onClick={() => {
          // Test full app
          window.location.href = '/?full-app=true';
        }}
        style={{
          background: '#008080',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        Load Full Application
      </button>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fef2f2',
        borderRadius: '8px'
      }}>
        <strong>Note:</strong> If you see this page, your basic React setup is working. 
        The white screen was likely caused by:
        <ol style={{ marginTop: '10px' }}>
          <li>Import path issue in Supabase client (fixed)</li>
          <li>Context provider initialization error</li>
          <li>Missing environment variables</li>
        </ol>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <TestApp />
  </StrictMode>
);
