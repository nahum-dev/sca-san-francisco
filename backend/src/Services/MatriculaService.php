<?php
declare(strict_types=1);
namespace App\Services;

use App\Models\MatriculaModel;
use App\Models\CursoModel;
use App\Models\EstudianteModel;
use RuntimeException;

final class MatriculaService
{
    private MatriculaModel  $matriculaModel;
    private CursoModel      $cursoModel;
    private EstudianteModel $estudianteModel;

    private const ESTADOS_VALIDOS = ['activo', 'retirado', 'egresado'];

    public function __construct()
    {
        $this->matriculaModel  = new MatriculaModel();
        $this->cursoModel      = new CursoModel();
        $this->estudianteModel = new EstudianteModel();
    }

    public function getByCurso(int $cursoId): array
    {
        if (!$this->cursoModel->findById($cursoId)) {
            throw new RuntimeException('Curso no encontrado.', 404);
        }
        return $this->matriculaModel->getByCurso($cursoId);
    }

    public function getByEstudiante(int $estudianteId): array
    {
        if (!$this->estudianteModel->findById($estudianteId)) {
            throw new RuntimeException('Estudiante no encontrado.', 404);
        }
        return $this->matriculaModel->getByEstudiante($estudianteId);
    }

    public function create(array $data): array
    {
        $required = ['curso_id', 'estudiante_id'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }

        $cursoId      = (int)$data['curso_id'];
        $estudianteId = (int)$data['estudiante_id'];

        if (!$this->cursoModel->findById($cursoId)) {
            throw new RuntimeException('El curso no existe.', 404);
        }

        if (!$this->estudianteModel->findById($estudianteId)) {
            throw new RuntimeException('El estudiante no existe.', 404);
        }

        if ($this->matriculaModel->exists($cursoId, $estudianteId)) {
            throw new RuntimeException('El estudiante ya está matriculado en este curso.', 409);
        }

        $id = $this->matriculaModel->create([
            'curso_id'        => $cursoId,
            'estudiante_id'   => $estudianteId,
            'fecha_matricula' => $data['fecha_matricula'] ?? date('Y-m-d'),
        ]);

        return $this->matriculaModel->findById($id);
    }

    public function updateEstado(int $id, string $estado): array
    {
        if (!in_array($estado, self::ESTADOS_VALIDOS, true)) {
            throw new RuntimeException(
                'Estado inválido. Use: ' . implode(', ', self::ESTADOS_VALIDOS),
                400
            );
        }

        $matricula = $this->matriculaModel->findById($id);
        if (!$matricula) {
            throw new RuntimeException('Matrícula no encontrada.', 404);
        }

        $this->matriculaModel->updateEstado($id, $estado);
        return $this->matriculaModel->findById($id);
    }

    public function delete(int $id): void
    {
        if (!$this->matriculaModel->findById($id)) {
            throw new RuntimeException('Matrícula no encontrada.', 404);
        }
        $this->matriculaModel->delete($id);
    }
}