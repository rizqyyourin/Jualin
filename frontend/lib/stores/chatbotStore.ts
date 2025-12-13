import { create } from 'zustand';
import { chatbotAPI, ChatMessage } from '../api/chatbot';

interface ChatbotStore {
    // State
    messages: ChatMessage[];
    sessionId: string | null;
    isOpen: boolean;
    isLoading: boolean;
    error: Error | null;

    // Actions
    sendMessage: (message: string) => Promise<void>;
    loadConversation: () => Promise<void>;
    clearConversation: () => Promise<void>;
    toggleChat: () => void;
    openChat: () => void;
    closeChat: () => void;
}

// Generate or get session ID from localStorage
const getSessionId = (): string => {
    let sessionId = localStorage.getItem('chatbot_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chatbot_session_id', sessionId);
    }
    return sessionId;
};

export const useChatbotStore = create<ChatbotStore>((set, get) => ({
    // Initial state
    messages: [],
    sessionId: null,
    isOpen: false,
    isLoading: false,
    error: null,

    // Send message to chatbot
    sendMessage: async (message: string) => {
        const { sessionId } = get();
        const currentSessionId = sessionId || getSessionId();

        // Add user message immediately (optimistic update)
        const userMessage: ChatMessage = {
            id: Date.now(),
            role: 'user',
            content: message,
            created_at: new Date().toISOString(),
        };

        set((state) => ({
            messages: [...state.messages, userMessage],
            isLoading: true,
            error: null,
            sessionId: currentSessionId,
        }));

        try {
            const response = await chatbotAPI.sendMessage(message, currentSessionId);

            // Add AI response
            set((state) => ({
                messages: [...state.messages, response.data.message],
                isLoading: false,
            }));
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to send message');
            set({ error, isLoading: false });
            console.error('Failed to send message:', error);
        }
    },

    // Load conversation history
    loadConversation: async () => {
        const sessionId = getSessionId();
        set({ isLoading: true, error: null, sessionId });

        try {
            const response = await chatbotAPI.getConversation(sessionId);
            set({
                messages: response.data.messages || [],
                isLoading: false,
            });
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load conversation');
            set({ error, isLoading: false });
            console.error('Failed to load conversation:', error);
        }
    },

    // Clear conversation
    clearConversation: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        try {
            await chatbotAPI.clearConversation(sessionId);
            localStorage.removeItem('chatbot_session_id');
            set({
                messages: [],
                sessionId: null,
                error: null,
            });
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to clear conversation');
            set({ error });
            console.error('Failed to clear conversation:', error);
        }
    },

    // Toggle chat window
    toggleChat: () => {
        set((state) => ({ isOpen: !state.isOpen }));
    },

    // Open chat window
    openChat: () => {
        const { messages, loadConversation } = get();
        set({ isOpen: true });
        // Load conversation if not already loaded
        if (messages.length === 0) {
            loadConversation();
        }
    },

    // Close chat window
    closeChat: () => {
        set({ isOpen: false });
    },
}));
