<?php
/**
 * Controllers/AuthController.php
 * Recibe las peticiones HTTP de autenticación y responde JSON.
 * NO contiene lógica de negocio ni consultas SQL.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Services\AuthService;
use App\Middleware\AuthMiddleware;
use App\Utils\ResponseHelper;
use RuntimeException;

final class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    /**
     * Enruta la petición según método HTTP y URL.
     */
    public function handle(string $method, string $uri): void
    {
        match(true) {
            $method === 'POST' && str_ends_with($uri, '/auth/cambiar-password') => $this->cambiarPassword(),
            $method === 'POST' && str_ends_with($uri, '/auth/login')    => $this->login(),
            $method === 'POST' && str_ends_with($uri, '/auth/register') => $this->register(),
            $method === 'GET'  && str_ends_with($uri, '/auth/me')       => $this->me(),
            default => ResponseHelper::notFound('Ruta de autenticación')
        };
    }

    /**
     * POST /api/auth/login
     * Recibe: { "identifier": "email o username", "password": "..." }
     * Retorna: { token, usuario, expira_en }
     */
    private function login(): void
    {
        $body = $this->getJsonBody();

        try {
            $resultado = $this->authService->login(
                $body['identifier'] ?? '',
                $body['password']   ?? ''
            );
            ResponseHelper::success($resultado, 'Login exitoso.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    

    /**
     * POST /api/auth/register
     * Solo accesible por Administradores (rol 1).
     * Recibe: { username, email, password, rol }
     */
    private function register(): void
    {
        // Verificar que sea administrador
        AuthMiddleware::authorize([AuthMiddleware::ROL_ADMIN]);

        $body = $this->getJsonBody();

        try {
            $usuario = $this->authService->register($body);
            ResponseHelper::success($usuario, 'Usuario creado exitosamente.', 201);
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    /**
     * GET /api/auth/me
     * Retorna los datos del usuario autenticado según su token.
     */
    private function me(): void
    {
        $payload = AuthMiddleware::authenticate();
        ResponseHelper::success((array)$payload->data, 'Datos del usuario autenticado.');
    }

    /**
     * Lee y decodifica el cuerpo JSON de la petición.
     */
    private function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    /**
 * POST /api/auth/cambiar-password
 * Recibe: { password_actual, password_nueva }
 */
/**
 * POST /api/auth/cambiar-password
 * Recibe: { password_actual, password_nueva }
 */
private function cambiarPassword(): void
{
    $payload = AuthMiddleware::authenticate();
    $body    = $this->getJsonBody();

    try {
        $this->authService->cambiarPassword(
            (int)$payload->data->id,
            $body['password_actual'] ?? '',
            $body['password_nueva']  ?? ''
        );
        ResponseHelper::success(null, 'Contraseña actualizada correctamente.');
    } catch (\RuntimeException $e) {
        ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
    }
}
}