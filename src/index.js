import React from 'react';
import ReactDOM from 'react-dom/client';
import Chatbot from './Chatbot';
import './index.css';

const App = () => {
    return (
        <div
            style={{
                display: 'inline-block',
                backgroundColor: 'transparent',
            }}
        >
            <Chatbot />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
