// ==================== CV CHATBOT WEBSOCKET SERVICE ====================

export interface CVData {
  personal_info: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  professional_summary: string;
  career_goal: string;
  experience: any[];
  education: any[];
  skills: string[];
  certifications: any[];
  projects: any[];
  languages: any[];
}

export interface ChatMessage {
  type: 'chat_message';
  role: 'assistant' | 'system' | 'user';
  content: string;
  streaming: boolean;
  metadata?: any;
}

export interface CVUpdateMessage {
  type: 'cv_update';
  cv_data: CVData;
  section: string;
  action: 'create' | 'update' | 'delete';
  metadata?: any;
}

export interface StatusMessage {
  type: 'status';
  content: string;
  metadata?: any;
}

export interface SuggestedPromptsMessage {
  type: 'suggested_prompts';
  prompts: string[];
  metadata?: any;
}

export interface FlowEventMessage {
  type: 'flow_event';
  flow_event: string;
  data?: any;
}

export type WebSocketMessage = 
  | ChatMessage 
  | CVUpdateMessage 
  | StatusMessage 
  | SuggestedPromptsMessage 
  | FlowEventMessage;

export type MessageHandler = (message: WebSocketMessage) => void;
export type ErrorHandler = (error: Event) => void;
export type ConnectionHandler = () => void;

export class CVChatService {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private token: string;
  private baseUrl: string;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private isManualClose = false;
  private onConnectionOpen?: ConnectionHandler;
  private onConnectionClose?: ConnectionHandler;
  private onConnectionError?: ErrorHandler;

  constructor(
    sessionId: string = 'new',
    token: string,
    baseUrl: string = 'ws://localhost:8000'
  ) {
    this.sessionId = sessionId;
    this.token = token;
    this.baseUrl = baseUrl;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.baseUrl}/ws/cv-chat/${this.sessionId}?token=${this.token}`;
        console.log('🔌 Connecting to CV Chat WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);
        this.isManualClose = false;

        this.ws.onopen = () => {
          console.log('✅ CV Chat WebSocket connected');
          this.reconnectAttempts = 0;
          
          if (this.onConnectionOpen) {
            this.onConnectionOpen();
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          
          if (this.onConnectionError) {
            this.onConnectionError(error);
          }
          
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          
          if (this.onConnectionClose) {
            this.onConnectionClose();
          }

          // Only attempt reconnect if not manually closed
          if (!this.isManualClose && event.code !== 1008) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type);
    
    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => handler(message));
    }

    // Also trigger handlers for 'all' type
    const allHandlers = this.messageHandlers.get('all');
    if (allHandlers && allHandlers.length > 0) {
      allHandlers.forEach(handler => handler(message));
    }
  }

  /**
   * Register a message handler for a specific message type
   */
  on(messageType: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    
    this.messageHandlers.get(messageType)!.push(handler);
  }

  /**
   * Remove a message handler
   */
  off(messageType: string, handler: MessageHandler) {
    const handlers = this.messageHandlers.get(messageType);
    
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Set connection event handlers
   */
  setConnectionHandlers(handlers: {
    onOpen?: ConnectionHandler;
    onClose?: ConnectionHandler;
    onError?: ErrorHandler;
  }) {
    this.onConnectionOpen = handlers.onOpen;
    this.onConnectionClose = handlers.onClose;
    this.onConnectionError = handlers.onError;
  }

  /**
   * Send a text message
   */
  sendMessage(content: string, metadata: any = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        content,
        metadata
      };
      
      this.ws.send(JSON.stringify(message));
      console.log('📤 Sent message:', content);
    } else {
      console.error('❌ WebSocket is not open. Current state:', this.ws?.readyState);
      throw new Error('WebSocket is not connected');
    }
  }

  /**
   * Upload a CV file (PDF or DOCX)
   */
  uploadCV(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(reader.result as ArrayBuffer);
            console.log('📤 Uploaded CV file:', file.name);
            resolve();
          } else {
            reject(new Error('WebSocket closed during upload'));
          }
        } catch (error) {
          console.error('❌ Failed to upload CV:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error('❌ Failed to read file:', reader.error);
        reject(reader.error);
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Upload CV as base64 (alternative method)
   */
  uploadCVBase64(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          if (this.ws?.readyState === WebSocket.OPEN) {
            const base64 = (reader.result as string).split(',')[1];
            this.ws.send(base64);
            console.log('📤 Uploaded CV file (base64):', file.name);
            resolve();
          } else {
            reject(new Error('WebSocket closed during upload'));
          }
        } catch (error) {
          console.error('❌ Failed to upload CV:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error('❌ Failed to read file:', reader.error);
        reject(reader.error);
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * End the current session
   */
  endSession() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'end_session'
      };
      
      this.ws.send(JSON.stringify(message));
      console.log('📤 Ended session');
    }
  }

  /**
   * Attempt to reconnect to the WebSocket
   */
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      
      console.log(
        `🔄 Reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('❌ Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect() {
    this.isManualClose = true;
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      console.log('🔌 Disconnected from CV Chat WebSocket');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Update session ID (for reconnecting to existing session)
   */
  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Get WebSocket ready state
   */
  getReadyState(): number | undefined {
    return this.ws?.readyState;
  }

  /**
   * Clear all message handlers
   */
  clearHandlers() {
    this.messageHandlers.clear();
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a new CV Chat service instance
 */
export const createCVChatService = (
  token: string,
  sessionId: string = 'new',
  baseUrl?: string
): CVChatService => {
  const wsBaseUrl = baseUrl || 
    (import.meta.env.VITE_WS_URL || 'ws://localhost:8000');
  
  return new CVChatService(sessionId, token, wsBaseUrl);
};

/**
 * Get session ID from localStorage
 */
export const getSavedSessionId = (): string | null => {
  return localStorage.getItem('cv_chat_session_id');
};

/**
 * Save session ID to localStorage
 */
export const saveSessionId = (sessionId: string) => {
  localStorage.setItem('cv_chat_session_id', sessionId);
};

/**
 * Clear saved session ID
 */
export const clearSessionId = () => {
  localStorage.removeItem('cv_chat_session_id');
};

export default CVChatService;
