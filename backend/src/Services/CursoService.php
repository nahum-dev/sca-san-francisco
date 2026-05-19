<?php
declare(strict_types=1);
namespace App\Services;

use App\Models\CursoModel;
use App\Models\AsignaturaModel;
use App\Models\DocenteModel;
use RuntimeException;

final class CursoService
{
    private CursoModel      $cursoModel;
    private AsignaturaModel $asignaturaModel;
    private DocenteModel    $docenteModel;

    public function __construct()
    {
        $this->cursoModel      = new CursoModel();
        $this->asignaturaModel = new AsignaturaModel();
        $this->docenteModel    = new DocenteModel();
    }

    public function getAll(string $search = ''): array
    {
        return $this->cursoModel->getAll($search);
    }

    public function getById(int $id): array
    {
        $curso = $this->cursoModel->findById($id);
        if (!$curso) {
            throw new RuntimeException('Curso no encontrado.', 404);
        }
        return $curso;
    }

    public function getByDocente(int $docenteId): array
    {
        return $this->cursoModel->getByDocente($docenteId);
    }

    public function create(array $data): array
    {
        $required = ['asignatura_id', 'docente_id', 'anio_escolar', 'periodo', 'grado', 'seccion'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }

        // Verificar que la asignatura existe
        if (!$this->asignaturaModel->findById((int)$data['asignatura_id'])) {
            throw new RuntimeException('La asignatura no existe.', 404);
        }

        // Verificar que el docente existe
        if (!$this->docenteModel->findById((int)$data['docente_id'])) {
            throw new RuntimeException('El docente no existe.', 404);
        }

        $id = $this->cursoModel->create([
            'asignatura_id' => (int)$data['asignatura_id'],
            'docente_id'    => (int)$data['docente_id'],
            'anio_escolar'  => (int)$data['anio_escolar'],
            'periodo'       => trim($data['periodo']),
            'grado'         => trim($data['grado']),
            'seccion'       => strtoupper(trim($data['seccion'])),
        ]);

        return $this->cursoModel->findById($id);
    }

    public function update(int $id, array $data): array
    {
        $this->getById($id);

        $required = ['asignatura_id', 'docente_id', 'anio_escolar', 'periodo', 'grado', 'seccion'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }

        $this->cursoModel->update($id, [
            'asignatura_id' => (int)$data['asignatura_id'],
            'docente_id'    => (int)$data['docente_id'],
            'anio_escolar'  => (int)$data['anio_escolar'],
            'periodo'       => trim($data['periodo']),
            'grado'         => trim($data['grado']),
            'seccion'       => strtoupper(trim($data['seccion'])),
        ]);

        return $this->cursoModel->findById($id);
    }

    public function delete(int $id): void
    {
        $this->getById($id);
        $this->cursoModel->delete($id);
    }
}