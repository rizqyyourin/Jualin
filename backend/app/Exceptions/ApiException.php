<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class ApiException extends Exception
{
    protected int $statusCode = 500;
    protected string $errorCode;

    public function __construct(string $message = 'An error occurred', string $errorCode = 'INTERNAL_ERROR', int $statusCode = 500)
    {
        parent::__construct($message);
        $this->errorCode = $errorCode;
        $this->statusCode = $statusCode;
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => $this->errorCode,
                'message' => $this->message,
            ],
        ], $this->statusCode);
    }
}
