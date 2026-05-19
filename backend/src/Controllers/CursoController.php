<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Services\CursoService;
use App\Middleware\AuthMiddleware;
use App\Utils\ResponseHelper;
use RuntimeException;

final class CursoController
{
    private CursoService $service;

    public function __construct()
    {
        $this->service = new CursoService();
    }

    public function handle(string $method, string $uri): void
    {
        $payload = AuthMiddleware::authorize([
            AuthMiddleware::ROL_ADMIN,
            AuthMiddleware::ROL_DOCENTE,
        ]);

        $parts = explode('/', trim($uri, '/'));
        $id    = isset($parts[2]) && is_numeric($parts[2]) ? (int)$parts[2] : null;

        // Ruta especial: /api/cursos/docente → cursos del docente logueado
        $esRutaDocente = isset($parts[2]) && $parts[2] === 'docente';

        match(true) {
            $method === 'GET'    && $esRutaDocente  => $this->byDocente((int)$payload->data->id),
            $method === 'GET'    && $id === null     => $this->index(),
            $method === 'GET'    && $id !== null     => $this->show($id),
            $method === 'POST'   && $id === null     => $this->store(),
            $method === 'PUT'    && $id !== null     => $this->update($id),
            $method === 'DELETE' && $id !== null     => $this->destroy($id),
            default => ResponseHelper::notFound('Ruta de cursos')
        };
    }

    private function index(): void
    {
        $search = $_GET['search'] ?? '';
        $cursos = $this->service->getAll($search);
        ResponseHelper::success($cursos, 'Cursos obtenidos correctamente.');
    }

    private function show(int $id): void
    {
        try {
            ResponseHelper::success($this->service->getById($id));
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 404));
        }
    }

    private function byDocente(int $docenteId): void
    {
        // Buscar el docente asociado al usuario logueado
        $sql  = "SELECT id FROM DOCENTES WHERE usuario_id = :uid";
        $pdo  = \App\Config\Database::getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':uid' => $docenteId]);
        $docente = $stmt->fetch();

        if (!$docente) {
            ResponseHelper::error('No tienes un perfil de docente asociado.', 404);
        }

        $cursos = $this->service->getByDocente((int)$docente['id']);
        ResponseHelper::success($cursos, 'Mis cursos.');
    }

    private function store(): void
    {
        try {
            $data  = $this->getJsonBody();
            $curso = $this->service->create($data);
            ResponseHelper::success($curso, 'Curso creado exitosamente.', 201);
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    private function update(int $id): void
    {
        try {
            $data  = $this->getJsonBody();
            $curso = $this->service->update($id, $data);
            ResponseHelper::success($curso, 'Curso actualizado correctamente.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    private function destroy(int $id): void
    {
        try {
            $this->service->delete($id);
            ResponseHelper::success(null, 'Curso desactivado correctamente.');
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