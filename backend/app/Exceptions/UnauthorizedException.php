<?php

namespace App\Exceptions;

class UnauthorizedException extends ApiException
{
    public function __construct(string $message = 'You are not authorized to perform this action')
    {
        parent::__construct(
            message: $message,
            errorCode: 'UNAUTHORIZED',
            statusCode: 401
        );
    }
}
