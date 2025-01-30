import React from 'react';

const MessageBubble = ({ text, type }) => {
    const isSent = type === 'sent';

    return (
        <div
            style={{
                background: isSent
                    ? 'linear-gradient(90deg, #f00, #f0f)'
                    : '#f1f1f1',
                color: isSent ? '#fff' : '#000',
                padding: '10px',
                borderRadius: '10px',
                marginBottom: '10px',
                maxWidth: '80%',
                alignSelf: isSent ? 'flex-end' : 'flex-start',
            }}
        >
            {text}
        </div>
    );
};

export default MessageBubble;
