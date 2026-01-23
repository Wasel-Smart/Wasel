// TEMPORARY TEST FILE - Minimal App to isolate white screen issue

function AppTest() {
  return (
    <div style={{ padding: 40, background: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#008080', fontSize: '32px', fontWeight: 'bold' }}>
        ✅ Wasel is running!
      </h1>
      <p style={{ fontSize: '18px', marginTop: 20 }}>
        If you see this, React is mounting successfully.
      </p>
      <div style={{ marginTop: 30, padding: 20, background: 'white', borderRadius: 8 }}>
        <h2>Diagnostics:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✅ main.tsx is executing</li>
          <li>✅ App component is rendering</li>
          <li>✅ Root element found</li>
          <li>✅ React is working</li>
        </ul>
      </div>
    </div>
  );
}

export default AppTest;
