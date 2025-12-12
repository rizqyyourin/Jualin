<?php

namespace App\Exceptions;

class ResourceNotFoundException extends ApiException
{
    public function __construct(string $resource = 'Resource', string $identifier = 'not found')
    {
        parent::__construct(
            message: "{$resource} {$identifier}",
            errorCode: 'RESOURCE_NOT_FOUND',
            statusCode: 404
        );
    }
}
