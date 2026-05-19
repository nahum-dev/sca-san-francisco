<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Services\DocenteService;
use App\Middleware\AuthMiddleware;
use App\Utils\ResponseHelper;
use RuntimeException;

final class DocenteController
{
    private DocenteService $service;

    public function __construct()
    {
        $this->service = new DocenteService();
    }

    public function handle(string $method, string $uri): void
    {
        AuthMiddleware::authorize([AuthMiddleware::ROL_ADMIN]);

        $parts = explode('/', trim($uri, '/'));
        $id    = isset($parts[2]) && is_numeric($parts[2]) ? (int)$parts[2] : null;

        match(true) {
            $method === 'GET'    && $id === null => $this->index(),
            $method === 'GET'    && $id !== null => $this->show($id),
            $method === 'POST'   && $id === null => $this->store(),
            $method === 'PUT'    && $id !== null => $this->update($id),
            $method === 'DELETE' && $id !== null => $this->destroy($id),
            default => ResponseHelper::notFound('Ruta de docentes')
        };
    }

    private function index(): void
    {
        $search   = trim($_GET['search'] ?? '');
        $docentes = $this->service->getAll($search);
        ResponseHelper::success($docentes, 'Docentes obtenidos correctamente.');
    }

    private function show(int $id): void
    {
        try {
            ResponseHelper::success($this->service->getById($id));
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 404));
        }
    }

    private function store(): void
    {
        try {
            $data    = $this->getJsonBody();
            $docente = $this->service->create($data);
            ResponseHelper::success($docente, 'Docente creado exitosamente.', 201);
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    private function update(int $id): void
    {
        try {
            $data    = $this->getJsonBody();
            $docente = $this->service->update($id, $data);
            ResponseHelper::success($docente, 'Docente actualizado correctamente.');
        } catch (RuntimeException $e) {
            ResponseHelper::error($e->getMessage(), (int)($e->getCode() ?: 400));
        }
    }

    private function destroy(int $id): void
    {
        try {
            $this->service->delete($id);
            ResponseHelper::success(null, 'Docente eliminado correctamente.');
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