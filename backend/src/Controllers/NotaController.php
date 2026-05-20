<?php
/**
 * Controllers/NotaController.php
 * Maneja las peticiones HTTP del módulo de notas.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Services\NotaService;
use App\Middleware\AuthMiddleware;
use App\Utils\ResponseHelper;
use RuntimeException;

final class NotaController
{
    private NotaService $service;

    public function __construct()
    {
        $this->service = new NotaService();
    }

    /**
     * GET  /api/notas?matricula_id=1  → listar notas de una matrícula
     * POST /api/notas                 → crear nota
     * PUT  /api/notas/5              → actualizar nota
     * DELETE /api/notas/5            → eliminar nota
     */
    public function handle(string $method, string $uri): void
{
    AuthMiddleware::authorize([
        AuthMiddleware::ROL_ADMIN,
        AuthMiddleware::ROL_DOCENTE,
        AuthMiddleware::ROL_ESTUDIANTE,
    ]);

    $parts = explode('/', trim($uri, '/'));
    $id    = isset($parts[2]) && is_numeric($parts[2]) ? (int)$parts[2] : null;

    if ($method === 'GET' && $id === null) {
        $this->index();
    } elseif ($method === 'POST' && $id === null) {
        $this->store();
    } elseif ($method === 'PUT' && $id !== null) {
        $this->update($id);
    } elseif ($method === 'DELETE' && $id !== null) {
        $this->destroy($id);
    } else {
        ResponseHelper::notFound('Ruta de notas');
    }
}
    /**
     * GET /api/notas?matricula_id=1
     */
    private function index(): void
{
    $payload     = AuthMiddleware::authenticate();
    $matriculaId = (int)($_GET['matricula_id'] ?? 0);

    if ($matriculaId === 0) {
        ResponseHelper::error('El parámetro matricula_id es obligatorio.', 400);
    }

    if ((int)$payload->data->rol === AuthMiddleware::ROL_ESTUDIANTE) {
        if (!isset($payload->data->estudiante_id)) {
            ResponseHelper::error('No tienes un perfil de estudiante asociado.', 403);
        }
        $pdo  = \App\Config\Database::getConnection();
        $sql  = "SELECT COUNT(*) FROM MATRICULA WHERE id = :mid AND estudiante_id = :eid";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':mid' => $matriculaId, ':eid' => $payload->data->estudiante_id]);
        if ((int)$stmt->fetchColumn() === 0) {
            ResponseHelper::error('No tienes acceso a estas notas.', 403);
        }
    }

    try {
        $notas = $this->service->getByMatricula($matriculaId);
        ResponseHelper::success($notas, 'Notas obtenidas correctamente.');
    } catch (\RuntimeException $e) {
        ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
    }
}
    /**
     * POST /api/notas
     */
    private function store(): void
    {
        try {
            $data = $this->getJsonBody();
            $nota = $this->service->create($data);
            ResponseHelper::success($nota, 'Nota registrada correctamente.', 201);
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    /**
     * PUT /api/notas/{id}
     */
    private function update(int $id): void
    {
        try {
            $data = $this->getJsonBody();
            $nota = $this->service->update($id, $data);
            ResponseHelper::success($nota, 'Nota actualizada correctamente.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    /**
     * DELETE /api/notas/{id}
     */
    private function destroy(int $id): void
    {
        try {
            $this->service->delete($id);
            ResponseHelper::success(null, 'Nota eliminada correctamente.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    private function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }
}