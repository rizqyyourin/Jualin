// Chatbot API Service
import api from '../api';

export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: {
        product_ids?: number[];
        intent?: string;
    } | null;
    created_at: string;
}

export interface Conversation {
    id: number;
    session_id: string;
    status: string;
    messages: ChatMessage[];
}

export interface SendMessageResponse {
    success: boolean;
    data: {
        session_id: string;
        conversation_id: number;
        message: ChatMessage;
    };
}

export interface ConversationResponse {
    success: boolean;
    data: {
        conversation_id?: number;
        session_id?: string;
        status?: string;
        messages: ChatMessage[];
    };
}

export const chatbotAPI = {
    /**
     * Send a message to the chatbot
     */
    sendMessage: async (message: string, sessionId?: string): Promise<SendMessageResponse> => {
        const response = await api.post('/chatbot/message', {
            message,
            session_id: sessionId,
        });
        return response.data;
    },

    /**
     * Get conversation history
     */
    getConversation: async (sessionId: string): Promise<ConversationResponse> => {
        const response = await api.get(`/chatbot/conversation/${sessionId}`);
        return response.data;
    },

    /**
     * Clear conversation history
     */
    clearConversation: async (sessionId: string): Promise<{ success: boolean }> => {
        const response = await api.delete(`/chatbot/conversation/${sessionId}`);
        return response.data;
    },

    /**
     * Get product recommendations
     */
    getRecommendations: async (context?: string): Promise<{ success: boolean; data: { products: any[] } }> => {
        const response = await api.post('/chatbot/recommendations', { context });
        return response.data;
    },
};
