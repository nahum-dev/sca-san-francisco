<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Services\MatriculaService;
use App\Middleware\AuthMiddleware;
use App\Utils\ResponseHelper;
use RuntimeException;

final class MatriculaController
{
    private MatriculaService $service;

    public function __construct()
    {
        $this->service = new MatriculaService();
    }

    public function handle(string $method, string $uri): void
    {
        AuthMiddleware::authorize([
            AuthMiddleware::ROL_ADMIN,
            AuthMiddleware::ROL_DOCENTE,
            AuthMiddleware::ROL_ESTUDIANTE,
        ]);

        $parts = explode('/', trim($uri, '/'));
        $id    = isset($parts[2]) && is_numeric($parts[2]) ? (int)$parts[2] : null;

        // Rutas especiales
        $esRutaCurso      = isset($parts[2]) && $parts[2] === 'curso';
        $esRutaEstudiante = isset($parts[2]) && $parts[2] === 'estudiante';
        $esRutaEstado     = isset($parts[3]) && $parts[3] === 'estado';

        match(true) {
            $method === 'GET'  && $esRutaCurso                        => $this->byCurso(),
            $method === 'GET'  && $esRutaEstudiante                   => $this->byEstudiante(),
            $method === 'POST' && $id === null                        => $this->store(),
            $method === 'PUT'  && $id !== null && $esRutaEstado       => $this->updateEstado($id),
            $method === 'DELETE' && $id !== null                      => $this->destroy($id),
            default => ResponseHelper::notFound('Ruta de matrículas')
        };
    }

    // GET /api/matriculas/curso?curso_id=1
    private function byCurso(): void
    {
        $cursoId = (int)($_GET['curso_id'] ?? 0);
        if ($cursoId === 0) {
            ResponseHelper::error('El parámetro curso_id es obligatorio.', 400);
        }
        try {
            $matriculas = $this->service->getByCurso($cursoId);
            ResponseHelper::success($matriculas, 'Matrículas del curso.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    // GET /api/matriculas/estudiante?estudiante_id=1
    private function byEstudiante(): void
    {
        // Permitir también al estudiante ver sus propias matrículas
        $payload      = AuthMiddleware::authenticate();
        $estudianteId = (int)($_GET['estudiante_id'] ?? 0);

        if ($estudianteId === 0) {
            ResponseHelper::error('El parámetro estudiante_id es obligatorio.', 400);
        }

        try {
            $matriculas = $this->service->getByEstudiante($estudianteId);
            ResponseHelper::success($matriculas, 'Matrículas del estudiante.');
        } catch (\RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    // POST /api/matriculas
    private function store(): void
    {
        try {
            $data      = $this->getJsonBody();
            $matricula = $this->service->create($data);
            ResponseHelper::success($matricula, 'Matrícula creada exitosamente.', 201);
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    // PUT /api/matriculas/{id}/estado
    private function updateEstado(int $id): void
    {
        try {
            $data      = $this->getJsonBody();
            $matricula = $this->service->updateEstado($id, $data['estado'] ?? '');
            ResponseHelper::success($matricula, 'Estado actualizado correctamente.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    // DELETE /api/matriculas/{id}
    private function destroy(int $id): void
    {
        try {
            $this->service->delete($id);
            ResponseHelper::success(null, 'Matrícula eliminada correctamente.');
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