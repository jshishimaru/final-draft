import Cookies from 'js-cookie';

export class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private messageCallbacks: ((message: any) => void)[] = [];
  private connectionCallbacks: (() => void)[] = [];
  private disconnectCallbacks: ((event: CloseEvent) => void)[] = [];
  private errorCallbacks: ((event: Event) => void)[] = [];

  /**
   * Connect to a WebSocket for a specific chat room
   * @param roomId The ID of the chat room to connect to
   * @returns A promise that resolves when connected
   */
  connect(roomId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get session key for authentication
      const sessionKey = Cookies.get('sessionid');
      
      if (!sessionKey) {
        reject(new Error('No session key found. User may not be authenticated.'));
        return;
      }

      // Create WebSocket connection with session key for authentication
      this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/?session_key=${sessionKey}`);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionCallbacks.forEach(callback => callback());
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageCallbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.disconnectCallbacks.forEach(callback => callback(event));
      };

      this.socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        this.errorCallbacks.forEach(callback => callback(event));
        reject(new Error('WebSocket connection error'));
      };
    });
  }

  /**
   * Send a message through the WebSocket
   * @param message Message content
   */
  sendMessage(message: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not connected');
      return;
    }

    this.socket.send(JSON.stringify({
      message: message
    }));
  }

  /**
   * Disconnect the WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Register callback for new messages
   * @param callback Function called when a new message is received
   */
  onMessage(callback: (message: any) => void): void {
    this.messageCallbacks.push(callback);
  }

  /**
   * Register callback for connection established
   * @param callback Function called when connection is established
   */
  onConnect(callback: () => void): void {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Register callback for disconnection
   * @param callback Function called when disconnected
   */
  onDisconnect(callback: (event: CloseEvent) => void): void {
    this.disconnectCallbacks.push(callback);
  }

  /**
   * Register callback for errors
   * @param callback Function called when an error occurs
   */
  onError(callback: (event: Event) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Check if the WebSocket is currently connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService;