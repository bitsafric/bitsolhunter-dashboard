import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchData } from './fetchData'; // Import the fetchData function

function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use effect to call the fetchData function
  useEffect(() => {
    fetchData('http://localhost:8000/api/data') // Replace with your API 
endpoint
      .then((data) => {
        setData(data);
        setLoading(false); // Data is loaded, stop showing the loading 
state
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="App">
      <div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount(count + 1)}>
            count is {count}
          </button>
          <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
        </div>
      </div>

      {/* Display loading text or fetched data */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Fetched Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

