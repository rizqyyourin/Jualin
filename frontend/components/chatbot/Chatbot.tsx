'use client';

import React, { useEffect, useRef } from 'react';
import { useChatbotStore } from '@/lib/stores/chatbotStore';
import { MessageCircle, X, Send, Trash2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils'; // Assuming standard shadcn utils exist, or I'll use template literals if not sure.

export default function Chatbot() {
    const {
        messages,
        isOpen,
        isLoading,
        sendMessage,
        clearConversation,
        toggleChat,
        closeChat,
    } = useChatbotStore();

    const [inputMessage, setInputMessage] = React.useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const message = inputMessage.trim();
        setInputMessage('');
        await sendMessage(message);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Apakah Anda yakin ingin menghapus riwayat chat?')) {
            await clearConversation();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                aria-label="Open chatbot"
            >
                <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    AI
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border">
            {/* Header */}
            <div
                className="bg-primary text-primary-foreground p-4 flex items-center justify-between cursor-pointer"
                onClick={toggleChat}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Jualin Assistant</h3>
                        <p className="text-xs text-primary-foreground/80">Powered by Google Gemma</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <button
                            onClick={handleClearChat}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                            title="Clear chat"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeChat();
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close chatbot"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-zinc-900/50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
                        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-medium text-foreground">Halo! Apa kabar?</p>
                        <p className="text-sm mt-2">
                            Saya siap membantu mencarikan produk atau menjawab pertanyaan Anda.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-card text-card-foreground border border-border rounded-bl-none'
                                        }`}
                                >
                                    <div className="prose prose-sm dark:prose-invert max-w-none break-words whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                    <span
                                        className={`text-[10px] block mt-1 ${msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                            }`}
                                    >
                                        {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-background border-t border-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ketik pesan Anda..."
                        className="flex-1 bg-muted/50 border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputMessage.trim() || isLoading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 h-auto shadow-sm"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Tekan Enter untuk mengirim pesan • Gemma 3 27B (High Limit)
                </p>
            </div>
        </div>
    );
}
