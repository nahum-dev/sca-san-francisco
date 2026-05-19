<?php
declare(strict_types=1);
namespace App\Services;

use App\Models\AsignaturaModel;
use RuntimeException;

final class AsignaturaService
{
    private AsignaturaModel $asignaturaModel;

    public function __construct()
    {
        $this->asignaturaModel = new AsignaturaModel();
    }

    public function getAll(string $search = ''): array
    {
        return $this->asignaturaModel->getAll($search);
    }

    public function getById(int $id): array
    {
        $asignatura = $this->asignaturaModel->findById($id);
        if (!$asignatura) {
            throw new RuntimeException('Asignatura no encontrada.', 404);
        }
        return $asignatura;
    }

    public function create(array $data): array
    {
        $required = ['codigo', 'nombre'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }

        if ($this->asignaturaModel->codigoExists($data['codigo'])) {
            throw new RuntimeException('El código de asignatura ya existe.', 409);
        }

        $id = $this->asignaturaModel->create([
            'codigo'      => strtoupper(trim($data['codigo'])),
            'nombre'      => trim($data['nombre']),
            'descripcion' => $data['descripcion'] ?? null,
            'activa'      => 1,
        ]);

        return $this->asignaturaModel->findById($id);
    }

    public function update(int $id, array $data): array
    {
        $this->getById($id);

        $required = ['codigo', 'nombre'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }

        if ($this->asignaturaModel->codigoExists($data['codigo'], $id)) {
            throw new RuntimeException('El código ya está en uso por otra asignatura.', 409);
        }

        // Respetar el estado activo actual si no se envía
        $asignaturaActual = $this->asignaturaModel->findById($id);

        $this->asignaturaModel->update($id, [
            'codigo'      => strtoupper(trim($data['codigo'])),
            'nombre'      => trim($data['nombre']),
            'descripcion' => $data['descripcion'] ?? null,
            'activa'      => $data['activa'] ?? $asignaturaActual['activa'],
        ]);

        return $this->asignaturaModel->findById($id);
    }

    public function delete(int $id): void
    {
        $this->getById($id);
        $this->asignaturaModel->delete($id);
    }
}