import React from 'react';
import logo from './logo.svg';
import './App.css';
// import WebSocketDemo from './TestComponent';

function App() {
  const username = "testuser"; // Имя пользователя, которое вы хотите передать
  const ws = new WebSocket(`ws://localhost:8081/?username=${encodeURIComponent(username)}`);
  
  ws.onopen = event => {
    alert('onopen');

    ws.send("Hello Web Socket!");
  };

  ws.onmessage = event => {
      alert('onmessage, ' + event.data);
  };

  ws.onclose = event => {
      alert('onclose');
  };

  ws.onerror = event => {
      alert('onerror');
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      
    </div>
  );
}

export default App;
