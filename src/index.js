import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import StateProvider from './store';
import io from 'socket.io-client';
import App from './components/App';
const PORT = process.env.PORT || 3000;
const socket = process.env.NODE_ENV === 'production' ? io() : io(`http://localhost:${PORT}`);

const Index = () => {
  return(
    <StateProvider socket={socket}>
      <App/>
    </StateProvider>
  );
};

ReactDOM.render(<Index />, document.getElementById('root'));