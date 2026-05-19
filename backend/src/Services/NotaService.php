<?php
/**
 * Services/NotaService.php
 * Lógica de negocio del módulo de notas.
 */

declare(strict_types=1);

namespace App\Services;

use App\Models\NotaModel;
use RuntimeException;

final class NotaService
{
    private NotaModel $notaModel;

    private const TIPOS_VALIDOS = ['examen', 'tarea', 'proyecto', 'participacion'];

    public function __construct()
    {
        $this->notaModel = new NotaModel();
    }

    /**
     * Retorna todas las notas de una matrícula con su promedio.
     */
    public function getByMatricula(int $matriculaId): array
    {
        $notas   = $this->notaModel->getByMatricula($matriculaId);
        $promedio = $this->notaModel->getPromedio($matriculaId);

        return [
            'notas'   => $notas,
            'resumen' => $promedio,
        ];
    }

    /**
     * Crea una nueva nota.
     */
    public function create(array $data): array
    {
        $this->validar($data);

        $id = $this->notaModel->create([
            'matricula_id' => (int)$data['matricula_id'],
            'tipo_eval'    => $data['tipo_eval'],
            'descripcion'  => trim($data['descripcion']),
            'calificacion' => (float)$data['calificacion'],
            'nota_maxima'  => (float)($data['nota_maxima'] ?? 10.00),
            'fecha_eval'   => $data['fecha_eval'],
        ]);

        return $this->notaModel->findById($id);
    }

    /**
     * Actualiza una nota existente.
     */
    public function update(int $id, array $data): array
    {
        $nota = $this->notaModel->findById($id);
        if (!$nota) {
            throw new RuntimeException('Nota no encontrada.', 404);
        }

        $this->validar($data);
        $this->notaModel->update($id, $data);
        return $this->notaModel->findById($id);
    }

    /**
     * Elimina una nota.
     */
    public function delete(int $id): void
    {
        $nota = $this->notaModel->findById($id);
        if (!$nota) {
            throw new RuntimeException('Nota no encontrada.', 404);
        }
        $this->notaModel->delete($id);
    }

    /**
     * Valida los campos de una nota.
     */
    private function validar(array $data): void
    {
        $required = ['matricula_id', 'tipo_eval', 'descripcion', 'calificacion', 'fecha_eval'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }

        if (!in_array($data['tipo_eval'], self::TIPOS_VALIDOS, true)) {
            throw new RuntimeException(
                'tipo_eval inválido. Use: ' . implode(', ', self::TIPOS_VALIDOS),
                400
            );
        }

        $cal = (float)$data['calificacion'];
        $max = (float)($data['nota_maxima'] ?? 10.00);

        if ($cal < 0 || $cal > $max) {
            throw new RuntimeException(
                "La calificación debe estar entre 0 y {$max}.",
                400
            );
        }
    }
}