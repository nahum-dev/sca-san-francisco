<?php
/**
 * Services/AsistenciaService.php
 * Lógica de negocio del módulo de asistencia.
 */

declare(strict_types=1);

namespace App\Services;

use App\Models\AsistenciaModel;
use RuntimeException;

final class AsistenciaService
{
    private AsistenciaModel $asistenciaModel;

    private const ESTADOS_VALIDOS = ['presente', 'ausente', 'tardanza', 'justificado'];

    public function __construct()
    {
        $this->asistenciaModel = new AsistenciaModel();
    }

    /**
     * Obtiene la lista de asistencia de un curso en una fecha.
     */
    public function getByCursoAndFecha(int $cursoId, string $fecha): array
    {
        if (empty($fecha) || !strtotime($fecha)) {
            throw new RuntimeException('La fecha no es válida.', 400);
        }
        return $this->asistenciaModel->getByCursoAndFecha($cursoId, $fecha);
    }

    /**
     * Guarda la asistencia de un curso completo en una fecha.
     * Recibe un array de registros, uno por estudiante.
     * Si ya existe lo actualiza, si no existe lo crea.
     */
    public function guardarAsistencia(array $registros, int $docenteId): array
    {
        if (empty($registros)) {
            throw new RuntimeException('No se enviaron registros de asistencia.', 400);
        }

        $resultados = [];

        foreach ($registros as $index => $registro) {
            // Validar cada registro
            if (empty($registro['matricula_id'])) {
                throw new RuntimeException("Falta matricula_id en el registro {$index}.", 400);
            }
            if (empty($registro['fecha'])) {
                throw new RuntimeException("Falta fecha en el registro {$index}.", 400);
            }
            if (!in_array($registro['estado'] ?? '', self::ESTADOS_VALIDOS, true)) {
                throw new RuntimeException(
                    "Estado inválido en registro {$index}. Use: " . implode(', ', self::ESTADOS_VALIDOS),
                    400
                );
            }

            $matriculaId = (int)$registro['matricula_id'];
            $fecha       = $registro['fecha'];

            // Si ya existe → actualizar, si no → crear
            if ($this->asistenciaModel->exists($matriculaId, $fecha)) {
                $this->asistenciaModel->update($matriculaId, $fecha, $registro);
                $accion = 'actualizado';
            } else {
                $this->asistenciaModel->create([
                    'matricula_id'   => $matriculaId,
                    'fecha'          => $fecha,
                    'estado'         => $registro['estado'],
                    'observaciones'  => $registro['observaciones'] ?? null,
                    'registrado_por' => $docenteId,
                ]);
                $accion = 'creado';
            }

            $resultados[] = [
                'matricula_id' => $matriculaId,
                'fecha'        => $fecha,
                'estado'       => $registro['estado'],
                'accion'       => $accion,
            ];
        }

        return $resultados;
    }
public function getReporteByMatricula(int $matriculaId): array
{
    $registros = $this->asistenciaModel->getReporteByMatricula($matriculaId);
    $resumen   = $this->asistenciaModel->getResumenByMatricula($matriculaId);

    return [
        'registros' => $registros,
        'resumen'   => $resumen,
    ];
}

public function getReporteByCurso(int $cursoId): array
{
    return $this->asistenciaModel->getReporteByCurso($cursoId);
}
    

    /**
     * Retorna el resumen de asistencia de un estudiante.
     */
    public function getResumen(int $matriculaId): array
    {
        return $this->asistenciaModel->getResumenByMatricula($matriculaId);
    }
}