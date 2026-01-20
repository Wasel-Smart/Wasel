// Simple debug app to test if React is working
export default function DebugApp() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#f0f0f0'
    }}>
      <div style={{ 
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#008080', marginBottom: '20px' }}>✅ React is Working!</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          If you see this, React is loaded successfully.
        </p>
        <div style={{ 
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          🚗 Wasel App
        </div>
        <p style={{ color: '#999', fontSize: '12px' }}>
          Debug Mode - Check console for any errors
        </p>
      </div>
    </div>
  );
}
