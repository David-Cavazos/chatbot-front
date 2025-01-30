import React from 'react';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';

const ChatWindow = () => {
    return (
        <div
            style={{
                width: '388px',
                height: '447px',
                border: '1px solid #ccc',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                backgroundColor: '#fff',
            }}
        >
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px',
                }}
            >
                <MessageBubble
                    text="Hola Lucia, mi hermana Karen está interesada en la beca y el diplomado, ¿Todavía hay lugar en la fundación?"
                    type="received"
                />
                <MessageBubble
                    text="En abril que haga el proceso de la beca."
                    type="sent"
                />
            </div>
            <ChatInput />
        </div>
    );
};

export default ChatWindow;
