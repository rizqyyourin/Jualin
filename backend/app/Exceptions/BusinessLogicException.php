<?php

namespace App\Exceptions;

class BusinessLogicException extends ApiException
{
    public function __construct(string $message = 'Business logic error', string $errorCode = 'BUSINESS_ERROR', int $statusCode = 400)
    {
        parent::__construct($message, $errorCode, $statusCode);
    }
}
