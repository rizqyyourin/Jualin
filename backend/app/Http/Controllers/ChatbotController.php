<?php

namespace App\Http\Controllers;

use App\Services\ChatbotService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;

class ChatbotController extends Controller
{
    protected ChatbotService $chatbotService;

    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Send a message to the chatbot
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'session_id' => 'nullable|string',
        ]);

        $userId = auth()->id(); // null if guest

        // Rate Limiting Logic
        $key = $userId
            ? 'chatbot-user:' . $userId
            : 'chatbot-guest:' . $request->ip();

        // Strategy: Conservative limits to stay within Gemini Free Tier (15 RPM global)
        $limit = $userId ? 10 : 6; // 10 msg/min for users, 6 msg/min for guests

        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'error' => [
                    'message' => 'Too many requests. Please wait ' . $seconds . ' seconds.',
                    'code' => 'RATE_LIMIT_EXCEEDED'
                ],
            ], 429);
        }

        RateLimiter::hit($key);

        // Get or generate session ID
        $sessionId = $request->session_id ?? Str::uuid()->toString();

        try {
            $result = $this->chatbotService->sendMessage(
                $sessionId,
                $request->message,
                $userId
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'session_id' => $result['session_id'],
                    'conversation_id' => $result['conversation_id'],
                    'message' => [
                        'id' => $result['ai_message']->id,
                        'role' => $result['ai_message']->role,
                        'content' => $result['ai_message']->content,
                        'metadata' => $result['ai_message']->metadata,
                        'created_at' => $result['ai_message']->created_at,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'message' => 'Failed to process message',
                    'details' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    /**
     * Get conversation history
     * 
     * @param string $sessionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConversation(string $sessionId)
    {
        try {
            $conversation = $this->chatbotService->getConversation($sessionId);

            if (!$conversation) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'messages' => [],
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'conversation_id' => $conversation->id,
                    'session_id' => $conversation->session_id,
                    'status' => $conversation->status,
                    'messages' => $conversation->messages->map(function ($msg) {
                        return [
                            'id' => $msg->id,
                            'role' => $msg->role,
                            'content' => $msg->content,
                            'metadata' => $msg->metadata,
                            'created_at' => $msg->created_at,
                        ];
                    }),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'message' => 'Failed to retrieve conversation',
                    'details' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    /**
     * Clear conversation history
     * 
     * @param string $sessionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearConversation(string $sessionId)
    {
        try {
            $deleted = $this->chatbotService->clearConversation($sessionId);

            return response()->json([
                'success' => true,
                'data' => [
                    'deleted' => $deleted,
                    'message' => $deleted ? 'Conversation cleared successfully' : 'Conversation not found',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'message' => 'Failed to clear conversation',
                    'details' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    /**
     * Get product recommendations
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecommendations(Request $request)
    {
        $request->validate([
            'context' => 'nullable|string|max:500',
        ]);

        try {
            $userId = auth()->id();
            $recommendations = $this->chatbotService->getRecommendations(
                $userId,
                $request->context
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => $recommendations,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'message' => 'Failed to get recommendations',
                    'details' => $e->getMessage(),
                ],
            ], 500);
        }
    }
}
