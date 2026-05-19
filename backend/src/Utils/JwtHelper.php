<?php
declare(strict_types=1);
namespace App\Utils;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use RuntimeException;

final class JwtHelper
{
    private const ALGORITHM = 'HS256';

    public static function generateToken(array $payload): string
    {
        $secret  = self::getSecret();
        $expTime = (int)($_ENV['JWT_EXPIRATION'] ?? 3600);

        $claims = [
            'iss'  => 'sca-san-francisco',
            'iat'  => time(),
            'exp'  => time() + $expTime,
            'sub'  => (string)($payload['id'] ?? ''),
            'data' => $payload,
        ];

        return JWT::encode($claims, $secret, self::ALGORITHM);
    }

    public static function validateToken(string $token): object
    {
        try {
            return JWT::decode($token, new Key(self::getSecret(), self::ALGORITHM));
        } catch (ExpiredException $e) {
            throw new RuntimeException('El token ha expirado.', 401);
        } catch (\Exception $e) {
            throw new RuntimeException('Token inválido.', 401);
        }
    }

    public static function extractFromHeader(string $authHeader): string
    {
        if (!str_starts_with($authHeader, 'Bearer ')) {
            throw new RuntimeException('Formato de Authorization inválido.', 401);
        }
        $token = trim(substr($authHeader, 7));
        if (empty($token)) {
            throw new RuntimeException('Token no proporcionado.', 401);
        }
        return $token;
    }

    private static function getSecret(): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? '';
        if (empty($secret)) {
            throw new RuntimeException('JWT_SECRET no configurado en .env');
        }
        return $secret;
    }
}