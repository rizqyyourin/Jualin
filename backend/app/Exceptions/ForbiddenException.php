<?php

namespace App\Exceptions;

class ForbiddenException extends ApiException
{
    public function __construct(string $message = 'This action is forbidden')
    {
        parent::__construct(
            message: $message,
            errorCode: 'FORBIDDEN',
            statusCode: 403
        );
    }
}
