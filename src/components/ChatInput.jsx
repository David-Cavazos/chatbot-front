import React, { useState } from 'react';

const ChatInput = () => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() !== '') {
            console.log('User message:', input);
            setInput('');
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                padding: '10px',
                borderTop: '1px solid #ccc',
            }}
        >
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe algo..."
                style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                }}
            />
            <button
                onClick={handleSend}
                style={{
                    marginLeft: '5px',
                    padding: '10px 15px',
                    backgroundColor: '#6200EA',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Enviar
            </button>
        </div>
    );
};

export default ChatInput;
