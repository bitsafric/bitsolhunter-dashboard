import React, { useEffect, useState, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Toast, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ buy: 0, sell: 0 });
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const previousLogCount = useRef(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${apiUrl}/logs`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        const data = await response.json();
        setLogs(data);

        // Show toast on new BUY/SELL logs
        const newLogs = data.length - previousLogCount.current;
        if (newLogs > 0) {
          const latest = data.slice(-newLogs);
          latest.forEach(log => {
            if (/buy|sell/i.test(log.message)) {
              setToastMsg(log.message);
              setShowToast(true);
            }
          });
        }

        previousLogCount.current = data.length;
        setLoading(false);
        setError(null);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const getLogBadge = (message) => {
    if (/buy/i.test(message)) return <span className="badge bg-success me-2">BUY</span>;
    if (/sell/i.test(message)) return <span className="badge bg-danger me-2">SELL</span>;
    if (/error|fail/i.test(message)) return <span className="badge bg-warning text-dark me-2">ERROR</span>;
    return null;
  };

  const isInDateRange = (timestamp) => {
    const date = new Date(timestamp);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    return (!from || date >= from) && (!to || date <= to);
  };

  const filteredLogs = logs.filter(
    log =>
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) &&
      isInDateRange(log.timestamp)
  );

  // Calculate today's BUY/SELL summary
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const buy = logs.filter(
      (log) => log.timestamp.startsWith(today) && /buy/i.test(log.message)
    ).length;
    const sell = logs.filter(
      (log) => log.timestamp.startsWith(today) && /sell/i.test(log.message)
    ).length;
    setSummary({ buy, sell });
  }, [logs]);

  const exportCSV = () => {
    const csvRows = [['ID', 'Message', 'Timestamp']];
    filteredLogs.forEach(log => {
      csvRows.push([log.id, log.message, log.timestamp]);
    });
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    downloadFile(csvContent, 'bitsol_logs.csv', 'text/csv');
  };

  const exportJSON = () => {
    const json = JSON.stringify(filteredLogs, null, 2);
    downloadFile(json, 'bitsol_logs.json', 'application/json');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-2">📊 BitsolHunter Dashboard</h2>
      <p className="text-muted">API URL: <code>{apiUrl}</code></p>

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex gap-2">
          <button className="btn btn-outline-success w-100" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-outline-primary w-100" onClick={exportJSON}>Export JSON</button>
        </div>
      </div>

      <div className="mb-3">
        <strong className="me-3 text-success">Today's Buys: {summary.buy}</strong>
        <strong className="text-danger">Today's Sells: {summary.sell}</strong>
      </div>

      {loading && <p>⏳ Loading logs...</p>}
      {error && <p className="text-danger">❌ {error}</p>}

      <h5>Logs:</h5>
      <TransitionGroup component="ul" className="list-group">
        {filteredLogs.length === 0 ? (
          <li className="list-group-item">No logs match your filters.</li>
        ) : (
          filteredLogs.map((log) => (
            <CSSTransition key={log.id} timeout={300} classNames="fade">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  {getLogBadge(log.message)}
                  {log.message}
                </span>
                <small className="text-muted">
                  {new Date(log.timestamp).toLocaleString()}
                </small>
              </li>
            </CSSTransition>
          ))
        )}
      </TransitionGroup>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide bg="info">
          <Toast.Body>🔔 {toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default App;

