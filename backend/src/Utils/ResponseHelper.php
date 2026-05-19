<?php
declare(strict_types=1);
namespace App\Utils;

final class ResponseHelper
{
    public static function success(mixed $data = null, string $message = 'OK', int $status = 200): void
    {
        self::send(['success' => true, 'message' => $message, 'data' => $data], $status);
    }

    public static function error(string $message, int $status = 400, array $errors = []): void
    {
        $body = ['success' => false, 'message' => $message];
        if (!empty($errors)) $body['errors'] = $errors;
        self::send($body, $status);
    }

    public static function unauthorized(string $message = 'No autorizado.'): void
    {
        self::error($message, 401);
    }

    public static function notFound(string $resource = 'Recurso'): void
    {
        self::error("{$resource} no encontrado.", 404);
    }

    private static function send(array $body, int $status): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        $body['timestamp'] = date('c');
        echo json_encode($body, JSON_UNESCAPED_UNICODE);
        exit;
    }
}