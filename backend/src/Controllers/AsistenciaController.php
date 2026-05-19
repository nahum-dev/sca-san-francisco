<?php
/**
 * Controllers/AsistenciaController.php
 * Maneja las peticiones HTTP del módulo de asistencia.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Services\AsistenciaService;
use App\Middleware\AuthMiddleware;
use App\Utils\ResponseHelper;
use RuntimeException;

final class AsistenciaController
{
    private AsistenciaService $service;

    public function __construct()
    {
        $this->service = new AsistenciaService();
    }

    /**
     * Enruta según método y URL.
     * GET  /api/asistencia?curso_id=1&fecha=2024-03-15  → listar
     * POST /api/asistencia                              → guardar
     * GET  /api/asistencia/resumen?matricula_id=1       → resumen
     */
    public function handle(string $method, string $uri): void
{
    $payload = AuthMiddleware::authorize([
        AuthMiddleware::ROL_ADMIN,
        AuthMiddleware::ROL_DOCENTE,
        AuthMiddleware::ROL_ESTUDIANTE,
    ]);

    $docenteId = (int)$payload->data->id;
    $parts     = explode('/', trim($uri, '/'));

    match(true) {
        $method === 'GET'  && isset($parts[2]) && $parts[2] === 'resumen'        => $this->resumen(),
        $method === 'GET'  && isset($parts[2]) && $parts[2] === 'reporte-curso'  => $this->reporteCurso(),
        $method === 'GET'  && isset($parts[2]) && $parts[2] === 'reporte'        => $this->reporteMatricula(),
        $method === 'GET'                                                         => $this->index(),
        $method === 'POST'                                                        => $this->store($docenteId),
        default => ResponseHelper::notFound('Ruta de asistencia')
    };
}

    /**
     * GET /api/asistencia?curso_id=1&fecha=2024-03-15
     */
    private function index(): void
    {
        $cursoId = (int)($_GET['curso_id'] ?? 0);
        $fecha   = $_GET['fecha'] ?? date('Y-m-d');

        if ($cursoId === 0) {
            ResponseHelper::error('El parámetro curso_id es obligatorio.', 400);
        }

        try {
            $asistencia = $this->service->getByCursoAndFecha($cursoId, $fecha);
            ResponseHelper::success($asistencia, "Asistencia del {$fecha}.");
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    /**
     * POST /api/asistencia
     * Body: { "registros": [ { matricula_id, fecha, estado, observaciones } ] }
     */
    private function store(int $docenteId): void
    {
        try {
            $body      = $this->getJsonBody();
            $registros = $body['registros'] ?? [];
            $resultado = $this->service->guardarAsistencia($registros, $docenteId);
            ResponseHelper::success($resultado, 'Asistencia guardada correctamente.', 201);
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    /**
     * GET /api/asistencia/resumen?matricula_id=1
     */
    private function resumen(): void
    {
        $matriculaId = (int)($_GET['matricula_id'] ?? 0);

        if ($matriculaId === 0) {
            ResponseHelper::error('El parámetro matricula_id es obligatorio.', 400);
        }

        try {
            $resumen = $this->service->getResumen($matriculaId);
            ResponseHelper::success($resumen, 'Resumen de asistencia.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    private function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    // GET /api/asistencia/reporte?matricula_id=1
private function reporteMatricula(): void
{
    $matriculaId = (int)($_GET['matricula_id'] ?? 0);
    if ($matriculaId === 0) {
        ResponseHelper::error('El parámetro matricula_id es obligatorio.', 400);
    }
    try {
        $reporte = $this->service->getReporteByMatricula($matriculaId);
        ResponseHelper::success($reporte, 'Reporte de asistencia del estudiante.');
    } catch (\RuntimeException $e) {
        ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
    }
}

// GET /api/asistencia/reporte-curso?curso_id=1
private function reporteCurso(): void
{
    $cursoId = (int)($_GET['curso_id'] ?? 0);
    if ($cursoId === 0) {
        ResponseHelper::error('El parámetro curso_id es obligatorio.', 400);
    }
    try {
        $reporte = $this->service->getReporteByCurso($cursoId);
        ResponseHelper::success($reporte, 'Reporte de asistencia del curso.');
    } catch (\RuntimeException $e) {
        ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
    }
}
}