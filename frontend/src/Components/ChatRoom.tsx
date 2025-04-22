import React, { useState, useEffect, useRef } from 'react';
import chatWebSocketService from '../websocketService';
import axios from 'axios';
import Cookies from 'js-cookie';

interface Message {
  message_id: number;
  message: string;
  username: string;
  user_id: number;
  timestamp: string;
  first_name: string;
  last_name: string;
}

interface ChatRoomProps {
  roomId: number;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages when component mounts
  useEffect(() => {
    // Load existing messages from REST API
    const loadMessages = async () => {
      try {
        const csrfCookie = Cookies.get('csrftoken');
        const response = await axios.get(`http://127.0.0.1:8000/finaldraft/chat/rooms/${roomId}/messages/`, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrfCookie,
            'Content-Type': 'application/json',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Referrer-Policy': 'same-origin',
          }
        });
        
        // Format messages from the API to match WebSocket message format
        const formattedMessages = response.data.map((msg: any) => ({
          message_id: msg.id,
          message: msg.content,
          username: msg.sender.username,
          user_id: msg.sender.id,
          timestamp: msg.timestamp,
          first_name: msg.sender.first_name,
          last_name: msg.sender.last_name
        }));
        
        setMessages(formattedMessages.reverse()); // Reverse to show latest messages at the bottom
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Failed to load messages. Please try again later.");
      }
    };

    loadMessages();
  }, [roomId]);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Set up WebSocket connection
    chatWebSocketService.connect(roomId)
      .then(() => {
        setIsConnected(true);
        setError(null);
      })
      .catch(err => {
        console.error("WebSocket connection error:", err);
        setError("Failed to connect to chat. Please refresh the page or try again later.");
      });

    // Register WebSocket event handlers
    chatWebSocketService.onMessage((data) => {
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          message_id: data.message_id,
          message: data.message,
          username: data.username,
          user_id: data.user_id,
          timestamp: data.timestamp,
          first_name: data.first_name,
          last_name: data.last_name
        }
      ]);
    });

    chatWebSocketService.onDisconnect(() => {
      setIsConnected(false);
    });

    // Cleanup function to disconnect WebSocket when component unmounts
    return () => {
      chatWebSocketService.disconnect();
    };
  }, [roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      chatWebSocketService.sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="chat-status">
        {isConnected ? (
          <span className="status-connected">Connected</span>
        ) : (
          <span className="status-disconnected">Disconnected</span>
        )}
      </div>
      
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.message_id} className="message">
            <div className="message-header">
              <span className="sender-name">{msg.first_name} {msg.last_name}</span>
              <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected}>Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;