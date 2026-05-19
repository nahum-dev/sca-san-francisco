<?php
declare(strict_types=1);
namespace App\Middleware;

use App\Utils\JwtHelper;
use App\Utils\ResponseHelper;

final class AuthMiddleware
{
    public const ROL_ADMIN      = 1;
    public const ROL_DOCENTE    = 2;
    public const ROL_ESTUDIANTE = 3;

    public static function authenticate(): object
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (empty($authHeader)) {
            ResponseHelper::unauthorized('Token no proporcionado.');
        }
        try {
            $token   = JwtHelper::extractFromHeader($authHeader);
            $payload = JwtHelper::validateToken($token);
        } catch (\RuntimeException $e) {
            ResponseHelper::unauthorized($e->getMessage());
        }
        return $payload;
    }

    public static function authorize(array $allowedRoles): object
    {
        $payload = self::authenticate();
        $userRol = (int)($payload->data->rol ?? 0);
        if (!in_array($userRol, $allowedRoles, true)) {
            ResponseHelper::error('No tiene permisos para esta acción.', 403);
        }
        return $payload;
    }
}