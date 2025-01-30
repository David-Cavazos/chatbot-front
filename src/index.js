import React from 'react';
import ReactDOM from 'react-dom/client';
import Chatbot from './Chatbot';
import './index.css';

const App = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f9f9f9',
            }}
        >
            <Chatbot />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
