import React, { useState, useEffect,useRef,useLayoutEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useLocation } from "react-router-dom";

const BASE_URL = "https://e3841e79-3eae-49cb-ae66-7474040b4750-00-2qhjyey8f19ud.worf.replit.dev";

const Chatbot = () => {
    const location = useLocation();  // Gets the full URL
    const searchParams = new URLSearchParams(location.search); 
    const chatbotId = searchParams.get("chatbot_id") || "NA"; 
    const [isMinimized, setIsMinimized] = useState(true);
    const [size, setSize] = useState({ width: 50, height: 50 });
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [firstOpen, setFirstOpen] = useState(true);
    const [streamingMessage, setStreamingMessage] = useState("");
    const chatContainerRef = useRef(null); // Ref for the chat container
    const isUserScrolledUp = useRef(false); // Track if user has scrolled up
    const name = "Cassandra"; // Variable name for the chatbot
    const [lastSentPosition, setLastSentPosition] = useState({ x: 20, y: 20 });

    const toggleMinimized = () => {
        setIsMinimized((prev) => {
            const newState = !prev;
            const newSize = newState ? { width: 50, height: 50 } : { width: 388, height: 447 };
    
            setSize(newSize);
    
            // Send message to parent window to update iframe size
            window.parent.postMessage({
                type: "resizeIframe",
                width: newSize.width,
                height: newSize.height
            }, "*");
    
            return newState;
        });
    };
    

    
    const sendSizeAndPositionToBubble = (minimizedState = isMinimized) => {
        const message = {
            width: minimizedState ? 50 : size.width,
            height: minimizedState ? 50 : size.height,
            x: position.x,
            y: position.y,
            isMinimized: minimizedState,
        };
    
        
            setLastSentPosition({ x: message.x, y: message.y });
            console.log("Sending to Bubble:", message);
            window.parent.postMessage(message, "*");
        
    };
    
    useLayoutEffect(() => {
        sendSizeAndPositionToBubble(); // Send updates whenever size, position, or state changes
    }, [size,position]);
    
    

    
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
                const response = await fetch(`${BASE_URL}/chat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_message: userMessage, chatbot_id: chatbotId }),
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
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "transparent", // Grey overlay with transparency
                        zIndex: 999, // Keeps it behind the chatbot
                    }}
                ></div>
            )}
    
            {isMinimized ? (
                <button
                id="chatbot-button"
                    style={{
                        position: 'fixed',
                        bottom: '0px',
                        right: '0px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(275deg, #ff002c, #d100ff)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        zIndex: 1001, // Ensure it is above everything
                        padding: '5px',  // Extra padding inside the button
                        margin: '10px',  // Space around the button inside the iframe
                        backgroundClip: 'padding-box', // Prevents shadow cutoff

                    }}
                    onClick={toggleMinimized}
                >
                    💬
                </button>
            ) : (
                    <div
                    id="chatbot-container"
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'fixed', 
                            top: '0', 
                            left: '0', 
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
                                onClick={toggleMinimized}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '16px',
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
            )}
        </>
    );
};

export default Chatbot;
