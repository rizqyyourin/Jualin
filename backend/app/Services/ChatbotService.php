<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Models\Order;
use App\Models\Category;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatbotService
{
    private ?string $apiKey;
    private string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');

        if (!$this->apiKey) {
            \Log::warning('GEMINI_API_KEY is not configured in .env file');
        }
    }

    /**
     * Get or create conversation by session ID
     */
    public function getOrCreateConversation(string $sessionId, ?int $userId = null): Conversation
    {
        $conversation = Conversation::where('session_id', $sessionId)->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'session_id' => $sessionId,
                'user_id' => $userId,
                'status' => 'active',
            ]);
        }

        return $conversation;
    }

    /**
     * Send message and get AI response
     */
    public function sendMessage(string $sessionId, string $userMessage, ?int $userId = null): array
    {
        // Check if API key is configured
        if (!$this->apiKey) {
            throw new \Exception('GEMINI_API_KEY belum dikonfigurasi. Silakan tambahkan API key ke file .env backend Anda. Dapatkan API key gratis di: https://makersuite.google.com/app/apikey');
        }

        // Get or create conversation
        $conversation = $this->getOrCreateConversation($sessionId, $userId);

        // Save user message
        $userMsg = Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $userMessage,
        ]);

        // Get conversation history for context
        $history = $this->getConversationHistory($conversation);

        // Generate AI response
        $aiResponse = $this->generateAIResponse($userMessage, $history, $userId);

        // Save AI message
        $aiMsg = Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $aiResponse['content'],
            'metadata' => $aiResponse['metadata'] ?? null,
        ]);

        return [
            'conversation_id' => $conversation->id,
            'session_id' => $sessionId,
            'user_message' => $userMsg,
            'ai_message' => $aiMsg,
        ];
    }

    /**
     * Generate AI response using Gemini API
     */
    private function generateAIResponse(string $userMessage, array $history, ?int $userId = null): array
    {
        // Build system prompt
        $systemPrompt = $this->buildSystemPrompt($userId);

        // Prepare conversation context
        $contents = [];

        // Add system prompt
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $systemPrompt]]
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => 'Understood. I am a helpful shopping assistant for Jualin e-commerce platform. How can I help you today?']]
        ];

        // Add conversation history (last 10 messages for context)
        foreach (array_slice($history, -10) as $msg) {
            $contents[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'model',
                'parts' => [['text' => $msg['content']]]
            ];
        }

        // Add current user message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]]
        ];

        try {
            // Call Gemini API with correct header format
            $response = Http::timeout(30)
                ->withHeaders([
                    'x-goog-api-key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post($this->apiUrl, [
                    'contents' => $contents,
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'topK' => 40,
                        'topP' => 0.95,
                        'maxOutputTokens' => 1024,
                    ],
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiContent = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';

                // Extract metadata (product recommendations, etc)
                $metadata = $this->extractMetadata($aiContent, $userMessage);

                return [
                    'content' => $aiContent,
                    'metadata' => $metadata,
                ];
            }

            return [
                'content' => 'Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.',
                'metadata' => null,
            ];
        } catch (\Exception $e) {
            \Log::error('Gemini API Error: ' . $e->getMessage());

            return [
                'content' => 'Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.',
                'metadata' => null,
            ];
        }
    }

    /**
     * Build system prompt for AI
     */
    private function buildSystemPrompt(?int $userId = null): string
    {
        // Get store statistics
        $productCount = Product::count();
        $categories = \App\Models\Category::pluck('name')->implode(', ');

        $prompt = "You are a helpful shopping assistant for Jualin, an Indonesian e-commerce platform.\n\n";
        $prompt .= "Store Information:\n";
        $prompt .= "- Total Products: {$productCount}\n";
        $prompt .= "- Available Categories: {$categories}\n\n";

        $prompt .= "Your role is to help customers:\n";
        $prompt .= "1. Find products they're looking for\n";
        $prompt .= "2. Track their orders\n";
        $prompt .= "3. Answer questions about shipping, returns, and policies\n";
        $prompt .= "4. Provide product recommendations\n\n";
        $prompt .= "Guidelines:\n";
        $prompt .= "- Be honest about what products are available. ONLY recommend products from the Available Categories list.\n";
        $prompt .= "- If a user asks for a category not in the list, politely inform them we don't have it yet.\n";
        $prompt .= "- Always be friendly, concise, and helpful\n";
        $prompt .= "- Respond in Indonesian or English based on user's language\n";
        $prompt .= "- When suggesting products, mention specific product names if possible\n";
        $prompt .= "- For order tracking, ask for order number if not provided\n";
        $prompt .= "- Keep responses under 200 words\n\n";

        // Add user context if available
        if ($userId) {
            $user = \App\Models\User::find($userId);
            if ($user) {
                $prompt .= "Current user: {$user->name} ({$user->email})\n";

                // Add recent orders context
                $recentOrders = Order::where('user_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->limit(3)
                    ->get();

                if ($recentOrders->count() > 0) {
                    $prompt .= "Recent orders: " . $recentOrders->pluck('order_number')->implode(', ') . "\n";
                }
            }
        }

        return $prompt;
    }

    /**
     * Extract metadata from AI response
     */
    private function extractMetadata(string $aiContent, string $userMessage): ?array
    {
        $metadata = [];

        // Check if user is asking about products
        if (preg_match('/(cari|tampilkan|lihat|rekomendasi|suggest)/i', $userMessage)) {
            // Search for relevant products
            $products = $this->searchProducts($userMessage);
            if ($products->count() > 0) {
                $metadata['product_ids'] = $products->pluck('id')->toArray();
                $metadata['intent'] = 'product_search';
            }
        }

        // Check if user is asking about orders
        if (preg_match('/(pesanan|order|tracking|status)/i', $userMessage)) {
            $metadata['intent'] = 'order_tracking';
        }

        return !empty($metadata) ? $metadata : null;
    }

    /**
     * Search products based on user query
     */
    private function searchProducts(string $query): \Illuminate\Database\Eloquent\Collection
    {
        return Product::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->limit(5)
            ->get();
    }

    /**
     * Get conversation history
     */
    private function getConversationHistory(Conversation $conversation): array
    {
        return $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'role' => $msg->role,
                    'content' => $msg->content,
                ];
            })
            ->toArray();
    }

    /**
     * Get conversation with messages
     */
    public function getConversation(string $sessionId): ?Conversation
    {
        return Conversation::where('session_id', $sessionId)
            ->with('messages')
            ->first();
    }

    /**
     * Clear conversation
     */
    public function clearConversation(string $sessionId): bool
    {
        $conversation = Conversation::where('session_id', $sessionId)->first();

        if ($conversation) {
            $conversation->messages()->delete();
            $conversation->delete();
            return true;
        }

        return false;
    }

    /**
     * Get product recommendations based on context
     */
    public function getRecommendations(?int $userId = null, ?string $context = null): array
    {
        $query = Product::query();

        // If user is logged in, get personalized recommendations
        if ($userId) {
            // Get user's recent orders to understand preferences
            $recentProducts = Order::where('user_id', $userId)
                ->with('items.product')
                ->latest()
                ->limit(5)
                ->get()
                ->pluck('items.*.product.category_id')
                ->flatten()
                ->unique();

            if ($recentProducts->count() > 0) {
                $query->whereIn('category_id', $recentProducts);
            }
        }

        // Get trending products
        return $query->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->toArray();
    }
}
