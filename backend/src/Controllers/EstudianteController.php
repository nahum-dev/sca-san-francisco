<?php
/**
 * Controllers/EstudianteController.php
 * Maneja las peticiones HTTP del módulo de estudiantes.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Services\EstudianteService;
use App\Middleware\AuthMiddleware;
use App\Utils\ResponseHelper;
use RuntimeException;

final class EstudianteController
{
    private EstudianteService $service;

    public function __construct()
    {
        $this->service = new EstudianteService();
    }

    /**
     * Enruta según método HTTP y URL.
     * GET    /api/estudiantes        → listar
     * GET    /api/estudiantes/5      → ver uno
     * POST   /api/estudiantes        → crear
     * PUT    /api/estudiantes/5      → actualizar
     * DELETE /api/estudiantes/5      → eliminar
     */
    public function handle(string $method, string $uri): void
    {
        // Todos los endpoints de estudiantes requieren estar autenticado
        AuthMiddleware::authorize([
            AuthMiddleware::ROL_ADMIN,
            AuthMiddleware::ROL_DOCENTE
        ]);

        // Extraer el ID de la URL si existe (/api/estudiantes/5 → 5)
        $parts = explode('/', trim($uri, '/'));
        $id    = isset($parts[2]) && is_numeric($parts[2]) ? (int)$parts[2] : null;

        match(true) {
            $method === 'GET'    && $id === null => $this->index(),
            $method === 'GET'    && $id !== null => $this->show($id),
            $method === 'POST'   && $id === null => $this->store(),
            $method === 'PUT'    && $id !== null => $this->update($id),
            $method === 'DELETE' && $id !== null => $this->destroy($id),
            // Agregar esta línea en el match
            $method === 'GET' && isset($parts[2]) && $parts[2] === 'usuario' && isset($parts[3]) => $this->showByUsuario((int)$parts[3]),
            default => ResponseHelper::notFound('Ruta de estudiantes')
        };
    }

    /**
     * GET /api/estudiantes?search=juan
     */
    private function index(): void
    {
        $search      = trim($_GET['search'] ?? '');
        $estudiantes = $this->service->getAll($search);
        ResponseHelper::success($estudiantes, 'Estudiantes obtenidos correctamente.');
    }

    /**
     * GET /api/estudiantes/{id}
     */
    private function show(int $id): void
    {
        try {
            $estudiante = $this->service->getById($id);
            ResponseHelper::success($estudiante);
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 404));
        }
    }

    /**
     * POST /api/estudiantes
     */
    private function store(): void
    {
        try {
            $data       = $this->getJsonBody();
            $estudiante = $this->service->create($data);
            ResponseHelper::success($estudiante, 'Estudiante creado exitosamente.', 201);
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    /**
     * PUT /api/estudiantes/{id}
     */
    private function update(int $id): void
    {
        try {
            $data       = $this->getJsonBody();
            $estudiante = $this->service->update($id, $data);
            ResponseHelper::success($estudiante, 'Estudiante actualizado correctamente.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    /**
     * DELETE /api/estudiantes/{id}
     */
    private function destroy(int $id): void
    {
        try {
            $this->service->delete($id);
            ResponseHelper::success(null, 'Estudiante eliminado correctamente.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    private function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    private function showByUsuario(int $usuarioId): void
    {
        // Este endpoint permite al estudiante ver sus propios datos
        $payload = AuthMiddleware::authenticate();

        // Solo puede ver sus propios datos
        if ((int)$payload->data->id !== $usuarioId &&
            (int)$payload->data->rol !== AuthMiddleware::ROL_ADMIN) {
            ResponseHelper::error('No tiene permisos.', 403);
        }

        try {
            $pdo  = \App\Config\Database::getConnection();
            $sql  = "SELECT e.*, u.email FROM ESTUDIANTES e
                    INNER JOIN USUARIOS u ON u.id = e.usuario_id
                    WHERE e.usuario_id = :uid";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':uid' => $usuarioId]);
            $estudiante = $stmt->fetch();

            if (!$estudiante) {
                ResponseHelper::notFound('Estudiante');
            }

            ResponseHelper::success($estudiante);
        } catch (\RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }
}