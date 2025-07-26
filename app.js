// 1. Make sure your FastAPI backend is running at http://127.0.0.1:8000
// 2. In your React project (e.g., in App.js or a separate component), fetch data from the FastAPI backend like this:

import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching backend:', error));
  }, []);

  return (
    <div>
      <h1>BitsolHunter Frontend</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;

