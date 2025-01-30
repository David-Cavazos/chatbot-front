import React, { useState, useEffect,useRef } from 'react';
import { Rnd } from 'react-rnd';

const Chatbot = () => {
    const [isMinimized, setIsMinimized] = useState(true);
    const [size, setSize] = useState({ width: 388, height: 447 });
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [firstOpen, setFirstOpen] = useState(true);
    const [streamingMessage, setStreamingMessage] = useState("");
    const chatContainerRef = useRef(null); // Ref for the chat container
    const isUserScrolledUp = useRef(false); // Track if user has scrolled up
    const name = "Cassandra"; // Variable name for the chatbot


    useEffect(() => {
        if (!isMinimized && firstOpen) {
            const fullMessage = `Hola, me llamo ${name}, soy un asistente virtual de IA para la Fundación CR. ¡Hazme cualquier pregunta para poder asistirte!`;
            let index = 0;

            // Start streaming immediately with the first character
            setStreamingMessage(fullMessage[index]);


            const interval = setInterval(() => {
                console.log(fullMessage.length)
                if (index < fullMessage.length - 1) {
                    setStreamingMessage((prev) => prev + fullMessage[index]);
                    index++;
                } else {
                    setStreamingMessage("")
                    setMessages((prev) => [...prev, { type: "bot", content: fullMessage }]);
                    clearInterval(interval);
                    console.log(messages)
                }
            }, 15); // Adjust the delay as needed

            setFirstOpen(false);
        }
    }, [isMinimized, firstOpen, name]);


    // Handle scroll position in the chat container
  useEffect(() => {
    const chatContainer = chatContainerRef.current;

    if (!isUserScrolledUp.current && chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
    }
  }, [messages, streamingMessage]);

  const handleScroll = () => {
    const chatContainer = chatContainerRef.current;

    if (chatContainer) {
      const isAtBottom =
        chatContainer.scrollHeight - chatContainer.scrollTop ===
        chatContainer.clientHeight;

      isUserScrolledUp.current = !isAtBottom; // Update scroll state
    }
  };


    // Function to send user message to the backend and stream the response
    const handleSendMessage = async () => {
        if (input.trim()) {
            const userMessage = input.trim();

            // Add user's message to the conversation
            setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
            setInput(""); // Clear input

            // Initialize streaming for the response
            setStreamingMessage(""); // Reset streaming message

            try {
                // Stream response from the backend
                const response = await fetch("http://127.0.0.1:8000/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_message: userMessage }),
                });

                if (!response.body) {
                    throw new Error("No response body");
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                let done = false;
                let streamedContent = "";

                while (!done) {
                    const { value, done: streamDone } = await reader.read();
                    done = streamDone;

                    if (value) {
                        const chunk = decoder.decode(value, { stream: true });
                        streamedContent += chunk;
                        let cleanedContent = streamedContent;

                        if (cleanedContent.startsWith("```html")) {
                            cleanedContent = cleanedContent.slice(7); // Remove the first 7 characters
                        }
                        if (cleanedContent.endsWith("```")) {
                            cleanedContent = cleanedContent.slice(0, -3); // Remove the last 3 characters
                        }


                        setStreamingMessage(cleanedContent);
                    }
                }

                // Finalize the streaming message
                // Finalize the streaming message
                let cleanedFinalContent = streamedContent;

                // Remove unwanted substrings from the finalized content
                if (cleanedFinalContent.startsWith("```html")) {
                    cleanedFinalContent = cleanedFinalContent.slice(7);
                }
                if (cleanedFinalContent.endsWith("```")) {
                    cleanedFinalContent = cleanedFinalContent.slice(0, -3);
                }

                setMessages((prev) => [
                    ...prev,
                    { type: "bot", content: cleanedFinalContent, isHtml: true },
                ]);
                setStreamingMessage(""); // Clear temporary streaming message
            } catch (error) {
                console.error("Error streaming response:", error);
            }
        }
    };

    return (
        <>
            {/* Grey Bacdkground Overlay */}
            {!isMinimized && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 1,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(255, 255, 255, 0.8)", // Grey overlay with transparency
                        zIndex: 999, // Keeps it behind the chatbot
                    }}
                ></div>
            )}
    
            {isMinimized ? (
                <button
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(275deg, #ff002c, #d100ff)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        zIndex: 1001, // Ensure it is above everything
                    }}
                    onClick={() => setIsMinimized(false)}
                >
                    💬
                </button>
            ) : (
                <Rnd
                    size={{ width: size.width, height: size.height }}
                    position={{ x: position.x, y: position.y }}
                    onDragStop={(e, d) => {
                        setPosition({ x: d.x, y: d.y });
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                        setPosition(position);
                    }}
                    minWidth={300}
                    minHeight={400}
                    style={{ zIndex: 1000 }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '15px',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                            backgroundColor: 'rgba(255, 255, 255, 0.35)',
                            backdropFilter: 'blur(25px)',
                            WebkitBackdropFilter: 'blur(25px)',
                        }}
                    >
                        <div
                            style={{
                                position: 'relative',
                                padding: '5px',
                                background: 'linear-gradient(150deg, #f00, #f0f)',
                                color: '#fff',
                                borderTopLeftRadius: '10px',
                                borderTopRightRadius: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                    src="https://imgur.com/MbK4TX7.jpg"
                                    alt="Chat image"
                                    style={{ width: '40px', height: '40px', marginRight: '15px', marginLeft: '5px' }}
                                />
                                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>@{name.toLowerCase()}</span>
                            </div>
                            <button
                                onClick={() => setIsMinimized(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    marginRight: '10px',
                                }}
                            >
                                ✕
                            </button>
                        </div>



                        <div
              ref={chatContainerRef} // Attach ref to chat container
              onScroll={handleScroll} // Handle scroll events
              style={{
                flex: 1,
                padding: "10px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
                            {/* Render all finalized messages */}
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: message.type === "user" ? "linear-gradient(30deg, #f00, #f0f)" : "#f1f1f1",
                                        color: message.type === "user" ? "#fff" : "#000",
                                        padding: "10px",
                                        borderRadius: "10px",
                                        marginBottom: "10px",
                                        maxWidth: "80%",
                                        alignSelf: message.type === "user" ? "flex-end" : "flex-start",
                                        fontSize: "15px",
                                        fontWeight: "500",
                                        fontFamily: "Arial, sans-serif",
                                    }}
                                >
                                    {message.isHtml ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: message.content,
                                            }}
                                        />
                                    ) : (
                                        message.content
                                    )}
                                </div>
                            ))}

                            {/* Show streaming message at the bottom */}
                            {streamingMessage && (
                                <div
                                    style={{
                                        background: "#f1f1f1",
                                        color: "#000",
                                        padding: "10px",
                                        borderRadius: "10px",
                                        marginBottom: "10px",
                                        maxWidth: "80%",
                                        alignSelf: "flex-start",
                                        fontSize: "15px",
                                        fontWeight: "500",
                                        fontFamily: "Arial, sans-serif",
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: streamingMessage,
                                    }}
                                >

                                </div>
                            )}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                padding: '10px',
                                borderTop: '1px solid #ccc',
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Escribe algo..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    fontFamily: 'Arial, sans-serif',
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                style={{
                                    marginLeft: '5px',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(120deg, #ff002c, #d100ff)',
                                    color: '#fff',
                                    border: 'none',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <img
                                    src="https://imgur.com/LkLbXtH.jpg"
                                    alt="Send button"
                                    style={{ maxWidth: '55%', maxHeight: '55%' }}
                                />
                            </button>
                        </div>
                    </div>
                </Rnd>
            )}
        </>
    );
};

export default Chatbot;
