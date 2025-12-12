<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;

class ValidationException extends ApiException
{
    protected array $errors = [];

    public function __construct(array $errors = [], string $message = 'Validation failed')
    {
        parent::__construct($message, 'VALIDATION_ERROR', 422);
        $this->errors = $errors;
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => $this->errorCode,
                'message' => $this->message,
                'errors' => $this->errors,
            ],
        ], $this->statusCode);
    }
}
