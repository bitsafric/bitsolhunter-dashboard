import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${apiUrl}/logs`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };
    fetchLogs();
  }, [apiUrl]);

  return (
    <div className="container">
      <h1>Welcome to BitsolHunter</h1>
      <p>API URL: {apiUrl}</p>

      <div className="logs-section">
        <h2>Logs:</h2>
        <div>
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className={`log-item ${log.type === 'trade' ? 'success' : 'error'}`}
              >
                <div className="message">{log.message}</div>
                <div className="timestamp">{log.timestamp}</div>
                <div className="token-symbol">{log.token_symbol}</div>
              </div>
            ))
          ) : (
            <div>No logs available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

